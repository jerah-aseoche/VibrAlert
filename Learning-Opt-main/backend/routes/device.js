import express from "express";
import { db } from "../db.js";
import { sendCommand } from "../server.js";
import { sendSensorTriggerEmail } from "../mailer.js";

const router = express.Router();

/* ───────── WEB COMMAND ───────── */
router.post("/command/:cmd", async (req, res) => {
  const cmd = req.params.cmd.toUpperCase();
  console.log("🌐 WEB CMD →", cmd);

  const sent = sendCommand(cmd);
  if (!sent) return res.status(503).json({ error: "ESP32 offline" });

  await db.query(
    `INSERT INTO detection_bypass_logs (action, source, status, details)
     VALUES (?, 'web', 'SENT', 'Manual web control')`,
    [cmd]
  );

  res.json({ ok: true });
});

/* ───────── ACK FROM ESP32 ───────── */
router.post("/ack", async (req, res) => {
  const { action, source } = req.body; // { action:"ON", source:"web" }
  console.log("🔄 ACK:", action, source);

  const [result] = await db.query(
    `UPDATE detection_bypass_logs
     SET status='SUCCESS', details='ESP32 acknowledged'
     WHERE source=? AND action=? AND status='SENT'
     ORDER BY created_at DESC
     LIMIT 1`,
    [source, action]
  );

  if (result.affectedRows === 0) {
    console.log("⏭️ No SENT row to ACK (duplicate/late)");
    return res.json({ ok: true });
  }

  await db.query(
    `UPDATE system_state
     SET alarm_status=?, last_event=?, last_source=?
     WHERE id=1`,
    [action === "ON" ? "ON" : "OFF", action, source]
  );

  res.json({ ok: true });
});

/* ───────── PHYSICAL BYPASS ───────── */
router.post("/physical-bypass", async (req, res) => {
  const { action, source, status, details } = req.body;
  console.log("🖲️ PHYSICAL:", action, source);

  await db.query(
    `INSERT INTO bypass_logs (action, source, status, details)
     VALUES (?, ?, ?, ?)`,
    [action, source || "device", status || "SUCCESS", details || "Physical button"]
  );

  await db.query(
    `UPDATE system_state
     SET alarm_status=?, last_event=?, last_source=?
     WHERE id=1`,
    [action === "ON" ? "ON" : "OFF", action, "device"]
  );

  res.json({ ok: true });
});

/* ───────── SENSOR TRIGGER (WITH TELEMETRY + DEDUPE + OFFLINE NOTE) ───────── */
router.post("/sensor-detection", async (req, res) => {
  const {
    event_id,                 // NEW: for dedupe
    occurred_offline,         // NEW: 0/1 or true/false
    status,
    details,

    // telemetry fields (optional)
    baseline_rms_g,
    threshold_g,
    safety_factor,
    samples,
    mpu_confirmation_count,
    event_mean_rms_g,
    event_peak_rms_g,
    mpu_hits,
    pendulum_hits,
  } = req.body || {};

  const offlineFlag = occurred_offline ? 1 : 0;

  // Basic guard: if ESP sends nothing, still accept but avoid crash
  const safeEventId =
    typeof event_id === "string" && event_id.trim().length
      ? event_id.trim()
      : null;

  const baseDetails = details || "Pendulum+MPU verified";
  const finalDetails = offlineFlag
    ? `${baseDetails} (occurred while offline)`
    : baseDetails;

  console.log(
    "📟 SENSOR TRIGGER",
    safeEventId ? `event_id=${safeEventId}` : "(no event_id)",
    offlineFlag ? "[OFFLINE_REPLAY]" : "[LIVE]"
  );

  try {
    // ── DEDUPE: if event_id exists and already stored, do NOTHING (no email)
    if (safeEventId) {
      const [[existing]] = await db.query(
        `SELECT id FROM detection_sensor_logs WHERE event_id=? LIMIT 1`,
        [safeEventId]
      );
      if (existing?.id) {
        return res.json({ ok: true, duplicate: true, detection_log_id: existing.id });
      }
    }

    // 1) Insert detection log (includes event_id + occurred_offline)
    const [ins] = await db.query(
      `INSERT INTO detection_sensor_logs (source, event, status, details, event_id, occurred_offline)
       VALUES ('sensor', 'TRIGGERED', ?, ?, ?, ?)`,
      [
        status || "ACTIVE",
        finalDetails,
        safeEventId,
        offlineFlag,
      ]
    );

    const detectionLogId = ins.insertId;

    // 2) Insert telemetry linked to this log (EVENT mode)
    await db.query(
      `INSERT INTO mpu_telemetry_logs
       (mode, detection_log_id, baseline_rms_g, threshold_g, safety_factor, samples,
        mpu_confirmation_count, event_mean_rms_g, event_peak_rms_g, mpu_hits, pendulum_hits)
       VALUES ('EVENT', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        detectionLogId,
        baseline_rms_g ?? null,
        threshold_g ?? null,
        safety_factor ?? null,
        samples ?? null,
        mpu_confirmation_count ?? null,
        event_mean_rms_g ?? null,
        event_peak_rms_g ?? null,
        mpu_hits ?? null,
        pendulum_hits ?? null,
      ]
    );

    // 3) Update system state (alarm ON because sensor triggered)
    await db.query(
      `UPDATE system_state
       SET alarm_status='ON', last_event='SENSOR', last_source='sensor'
       WHERE id=1`
    );

    // 4) Email after DB success
    try {
      const info = await sendSensorTriggerEmail({
        detection_log_id: detectionLogId,
        received_at: new Date().toISOString(), // email copy can show this as received time
        event_id: safeEventId,
        occurred_offline: Boolean(offlineFlag),

        status: status || "ACTIVE",
        details: finalDetails,

        baseline_rms_g,
        threshold_g,
        safety_factor,
        samples,
        mpu_confirmation_count,
        event_mean_rms_g,
        event_peak_rms_g,
        mpu_hits,
        pendulum_hits,
      });

      console.log("EMAIL_SENT", info?.messageId || info);
    } catch (mailErr) {
      console.error("EMAIL_FAILED", mailErr?.message || mailErr);
      // don't fail API because email failed
    }

    return res.json({ ok: true, detection_log_id: detectionLogId });
  } catch (err) {
    console.error("SENSOR_DETECTION_FAILED", err?.message || err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

/* ───────── AUTO STOP ───────── */
router.post("/auto-stop", async (req, res) => {
  const { source, details } = req.body;
  console.log("⏱ AUTO STOP:", source);

  if (source === "sensor") {
    await db.query(
      `INSERT INTO detection_sensor_logs (event,source,status,details)
       VALUES ('AUTO_STOP','sensor','SUCCESS',?)`,
      [details]
    );
  } else if (source === "web") {
    await db.query(
      `INSERT INTO detection_bypass_logs (action,source,status,details)
       VALUES ('AUTO_STOP','web','SUCCESS',?)`,
      [details]
    );
  } else {
    await db.query(
      `INSERT INTO bypass_logs (action,source,status,details)
       VALUES ('AUTO_STOP','device','SUCCESS',?)`,
      [details]
    );
  }

  await db.query(
    `UPDATE system_state
     SET alarm_status='OFF', last_event='AUTO_STOP', last_source=?
     WHERE id=1`,
    [source || "system"]
  );

  res.json({ ok: true });
});

/* ───────── MPU TELEMETRY (CALIBRATION) ───────── */
router.post("/mpu-telemetry", async (req, res) => {
  const {
    mode,
    baseline_rms_g,
    threshold_g,
    safety_factor,
    samples,
    mpu_confirmation_count
  } = req.body;

  await db.query(
    `INSERT INTO mpu_telemetry_logs
     (mode, baseline_rms_g, threshold_g, safety_factor, samples, mpu_confirmation_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      mode || "CALIBRATION",
      baseline_rms_g ?? null,
      threshold_g ?? null,
      safety_factor ?? null,
      samples ?? null,
      mpu_confirmation_count ?? null
    ]
  );

  res.json({ ok: true });
});

/* ───────── HEARTBEAT FROM ESP32 ───────── */
router.post("/heartbeat", async (req, res) => {
  const { ip } = req.body || {};

  await db.query(
    `UPDATE system_state
     SET device_online=1,
         device_last_seen=NOW(),
         device_ip=COALESCE(?, device_ip),
         updated_at=NOW()
     WHERE id=1`,
    [ip || null]
  );

  res.json({ ok: true });
});

/* ───────── SYSTEM STATE ───────── */
router.get("/state", async (_, res) => {
  const [[row]] = await db.query(
    `SELECT
       alarm_status,
       last_event,
       last_source,
       device_online,
       ws_connected,
       device_last_seen,
       device_ip
     FROM system_state
     WHERE id=1`
  );
  res.json(row);
});

/* ───────── FETCH LOGS ───────── */
router.get("/sensor-logs", async (_, res) => {
  const [rows] = await db.query(
    `SELECT
       d.*,
       t.event_mean_rms_g,
       t.event_peak_rms_g,
       t.baseline_rms_g,
       t.threshold_g,
       t.mpu_hits,
       t.pendulum_hits
     FROM detection_sensor_logs d
     LEFT JOIN mpu_telemetry_logs t
       ON t.detection_log_id = d.id AND t.mode = 'EVENT'
     ORDER BY d.created_at DESC`
  );

  res.json(rows);
});

router.get("/web-bypass-logs", async (_, res) => {
  const [r] = await db.query(
    "SELECT * FROM detection_bypass_logs ORDER BY created_at DESC"
  );
  res.json(r);
});

router.get("/device-bypass-logs", async (_, res) => {
  const [r] = await db.query(
    "SELECT * FROM bypass_logs ORDER BY created_at DESC"
  );
  res.json(r);
});

/* ───────── CLEAR LOGS ───────── */
router.delete("/sensor-logs", async (_, res) => {
  await db.query("DELETE FROM detection_sensor_logs");
  res.json({ ok: true });
});

router.delete("/web-bypass-logs", async (_, res) => {
  await db.query("DELETE FROM detection_bypass_logs");
  res.json({ ok: true });
});

router.delete("/device-bypass-logs", async (_, res) => {
  await db.query("DELETE FROM bypass_logs");
  res.json({ ok: true });
});

export default router;
