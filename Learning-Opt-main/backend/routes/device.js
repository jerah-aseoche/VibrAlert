import express from "express";
import DetectionSensorLog from "../models/DetectionSensorLog.js";
import MpuTelemetryLog from "../models/MpuTelemetryLog.js";
import SystemState from "../models/SystemState.js";
import DetectionBypassLog from "../models/DetectionBypassLog.js";
import BypassLog from "../models/BypassLog.js";
import { sendCommand } from "../server.js";

const router = express.Router();

// Sensor detection with MongoDB
router.post("/sensor-detection", async (req, res) => {
  const {
    event_id,
    occurred_offline,
    status,
    details,
    baseline_rms_g,
    threshold_g,
    safety_factor,
    samples,
    mpu_confirmation_count,
    event_mean_rms_g,
    event_peak_rms_g,
    mpu_hits,
  } = req.body || {};

  const offlineFlag = occurred_offline ? 1 : 0;
  const safeEventId = typeof event_id === "string" && event_id.trim().length
    ? event_id.trim()
    : null;

  try {
    // Check for duplicate
    if (safeEventId) {
      const existing = await DetectionSensorLog.findOne({ event_id: safeEventId });
      if (existing) {
        return res.json({ ok: true, duplicate: true, detection_log_id: existing._id });
      }
    }

    // Save to MongoDB
    const detectionLog = new DetectionSensorLog({
      source: 'sensor',
      event: 'TRIGGERED',
      status: status || 'ACTIVE',
      details: details || "MPU6050 vibration detected",
      event_id: safeEventId,
      occurred_offline: offlineFlag
    });
    
    await detectionLog.save();

    // Save telemetry
    const telemetryLog = new MpuTelemetryLog({
      mode: 'EVENT',
      detection_log_id: detectionLog._id,
      baseline_rms_g: baseline_rms_g ?? null,
      threshold_g: threshold_g ?? null,
      safety_factor: safety_factor ?? null,
      samples: samples ?? null,
      mpu_confirmation_count: mpu_confirmation_count ?? null,
      event_mean_rms_g: event_mean_rms_g ?? null,
      event_peak_rms_g: event_peak_rms_g ?? null,
      mpu_hits: mpu_hits ?? null
    });
    
    await telemetryLog.save();

    // Update system state
    await SystemState.findOneAndUpdate(
      { id: 1 },
      { 
        alarm_status: 'ON', 
        last_event: 'SENSOR', 
        last_source: 'sensor',
        updated_at: new Date()
      },
      { upsert: true }
    );

    console.log(`✅ Detection saved to MongoDB: ${detectionLog._id}`);
    return res.json({ ok: true, detection_log_id: detectionLog._id });
    
  } catch (err) {
    console.error("SENSOR_DETECTION_FAILED:", err?.message);
    // Still return success to ESP32 - we'll queue it
    return res.json({ ok: true, queued: true });
  }
});

// Get system state
router.get("/state", async (req, res) => {
  try {
    let state = await SystemState.findOne({ id: 1 });
    if (!state) {
      state = await SystemState.create({
        id: 1,
        alarm_status: 'OFF',
        device_online: false,
        ws_connected: false
      });
    }
    res.json(state);
  } catch (err) {
    res.json({ alarm_status: 'OFF', device_online: false });
  }
});

// Get sensor logs
router.get("/sensor-logs", async (req, res) => {
  try {
    const logs = await DetectionSensorLog.find()
      .sort({ created_at: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.json([]);
  }
});

// Get web bypass logs
router.get("/web-bypass-logs", async (req, res) => {
  try {
    const logs = await DetectionBypassLog.find()
      .sort({ created_at: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.json([]);
  }
});

// Get device bypass logs
router.get("/device-bypass-logs", async (req, res) => {
  try {
    const logs = await BypassLog.find()
      .sort({ created_at: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.json([]);
  }
});

// Clear logs
router.delete("/sensor-logs", async (req, res) => {
  await DetectionSensorLog.deleteMany({});
  res.json({ ok: true });
});

router.delete("/web-bypass-logs", async (req, res) => {
  await DetectionBypassLog.deleteMany({});
  res.json({ ok: true });
});

router.delete("/device-bypass-logs", async (req, res) => {
  await BypassLog.deleteMany({});
  res.json({ ok: true });
});

// Physical bypass
router.post("/physical-bypass", async (req, res) => {
  const { action, source, status, details } = req.body;
  
  const log = new BypassLog({
    action: action,
    source: source || "device",
    status: status || "SUCCESS",
    details: details || "Physical button"
  });
  await log.save();
  
  await SystemState.findOneAndUpdate(
    { id: 1 },
    { 
      alarm_status: action === "ON" ? "ON" : "OFF",
      last_event: action,
      last_source: "device",
      updated_at: new Date()
    },
    { upsert: true }
  );
  
  res.json({ ok: true });
});

// Heartbeat
router.post("/heartbeat", async (req, res) => {
  const { ip } = req.body || {};
  
  await SystemState.findOneAndUpdate(
    { id: 1 },
    {
      device_online: true,
      device_last_seen: new Date(),
      device_ip: ip || null,
      updated_at: new Date()
    },
    { upsert: true }
  );
  
  res.json({ ok: true });
});

// Web command
router.post("/command/:cmd", async (req, res) => {
  const cmd = req.params.cmd.toUpperCase();
  console.log("🌐 WEB CMD →", cmd);
  
  const sent = sendCommand(cmd);
  if (!sent) {
    return res.status(503).json({ error: "ESP32 offline" });
  }
  
  const log = new DetectionBypassLog({
    action: cmd,
    source: 'web',
    status: 'SENT',
    details: 'Manual web control'
  });
  await log.save();
  
  res.json({ ok: true });
});

// Auto stop
router.post("/auto-stop", async (req, res) => {
  const { source, details } = req.body;
  
  if (source === "sensor") {
    const log = new DetectionSensorLog({
      event: 'AUTO_STOP',
      source: 'sensor',
      status: 'SUCCESS',
      details: details || "Auto-stop triggered"
    });
    await log.save();
  } else if (source === "web") {
    const log = new DetectionBypassLog({
      action: 'AUTO_STOP',
      source: 'web',
      status: 'SUCCESS',
      details: details || "Web auto-stop"
    });
    await log.save();
  } else {
    const log = new BypassLog({
      action: 'AUTO_STOP',
      source: 'device',
      status: 'SUCCESS',
      details: details || "Device auto-stop"
    });
    await log.save();
  }
  
  await SystemState.findOneAndUpdate(
    { id: 1 },
    {
      alarm_status: 'OFF',
      last_event: 'AUTO_STOP',
      last_source: source || "system",
      updated_at: new Date()
    },
    { upsert: true }
  );
  
  res.json({ ok: true });
});

// MPU Telemetry (Calibration)
router.post("/mpu-telemetry", async (req, res) => {
  const { mode, baseline_rms_g, threshold_g, safety_factor, samples, mpu_confirmation_count } = req.body;
  
  const log = new MpuTelemetryLog({
    mode: mode || "CALIBRATION",
    baseline_rms_g: baseline_rms_g ?? null,
    threshold_g: threshold_g ?? null,
    safety_factor: safety_factor ?? null,
    samples: samples ?? null,
    mpu_confirmation_count: mpu_confirmation_count ?? null
  });
  await log.save();
  
  res.json({ ok: true });
});

export default router;