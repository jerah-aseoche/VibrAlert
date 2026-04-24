import express from "express";
import DetectionSensorLog from "../models/DetectionSensorLog.js";
import MpuTelemetryLog from "../models/MpuTelemetryLog.js";
import SystemState from "../models/SystemState.js";
import DetectionBypassLog from "../models/DetectionBypassLog.js";
import BypassLog from "../models/BypassLog.js";
import { sendCommand } from "../server.js";
import { sendSensorTriggerEmail, sendTestEmail, getEmailStatus } from "../email.js";

const router = express.Router();

// Store admin token in memory (for demo purposes)
// In production, this should be stored in MongoDB
let adminToken = null;

// Helper function to send email notification with severity (non-blocking)
const sendEmailNotification = async (eventData) => {
  try {
    const result = await sendSensorTriggerEmail(eventData);
    if (result.ok) {
      console.log(`📧 Email sent with severity: ${result.severity?.toUpperCase() || 'UNKNOWN'}`);
    } else {
      console.log('⚠️ Email notification skipped:', result.reason || result.error);
    }
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
};

// Generate a random token
function generateToken() {
  return 'qr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
}

// Get current admin token
router.get("/admin-token", async (req, res) => {
  try {
    // If no token exists, create one
    if (!adminToken) {
      adminToken = generateToken();
      console.log("📱 Generated new admin token:", adminToken);
    }
    res.json({ token: adminToken });
  } catch (error) {
    console.error("Failed to get admin token:", error);
    res.status(500).json({ error: "Failed to get admin token" });
  }
});

// Set/update admin token
router.post("/admin-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      adminToken = token;
      console.log("📱 Admin token updated:", adminToken);
      res.json({ ok: true, token: adminToken });
    } else {
      res.status(400).json({ error: "No token provided" });
    }
  } catch (error) {
    console.error("Failed to set admin token:", error);
    res.status(500).json({ error: "Failed to set admin token" });
  }
});

router.post("/validate-admin-token", async (req, res) => {
  console.log("========== VALIDATE TOKEN ROUTE HIT ==========");
  console.log("Request body:", req.body);
  console.log("Current adminToken in memory:", adminToken);
});

// Validate admin token for QR login
router.post("/validate-admin-token", async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log("🔍 Validating token - Received:", token);
    console.log("🔍 Validating token - Stored:", adminToken);
    
    if (token && adminToken && token === adminToken) {
      console.log("✅ Token validation successful");
      res.json({ valid: true });
    } else {
      console.log("❌ Token validation failed");
      res.json({ valid: false });
    }
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ error: "Failed to validate token" });
  }
});

// Sensor detection with MongoDB + Email
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
    
    // Send email notification with severity-based template (non-blocking)
    sendEmailNotification({
      event_id: safeEventId || detectionLog._id.toString(),
      detection_log_id: detectionLog._id,
      created_at: new Date().toISOString(),
      event_mean_rms_g: event_mean_rms_g,
      event_peak_rms_g: event_peak_rms_g,
      threshold_g: threshold_g,
      baseline_rms_g: baseline_rms_g,
      occurred_offline: offlineFlag === 1
    });
    
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
    // Ensure we return an array
    const logsData = Array.isArray(logs) ? logs : [];
    res.json(logsData);
  } catch (err) {
    console.error("Failed to fetch sensor logs:", err);
    res.json([]);
  }
});

// Get web bypass logs
router.get("/web-bypass-logs", async (req, res) => {
  try {
    const logs = await DetectionBypassLog.find()
      .sort({ created_at: -1 })
      .limit(100);
    const logsData = Array.isArray(logs) ? logs : [];
    res.json(logsData);
  } catch (err) {
    console.error("Failed to fetch web bypass logs:", err);
    res.json([]);
  }
});

// Get device bypass logs
router.get("/device-bypass-logs", async (req, res) => {
  try {
    const logs = await BypassLog.find()
      .sort({ created_at: -1 })
      .limit(100);
    const logsData = Array.isArray(logs) ? logs : [];
    res.json(logsData);
  } catch (err) {
    console.error("Failed to fetch device bypass logs:", err);
    res.json([]);
  }
});

// Email status endpoint
router.get("/email-status", async (req, res) => {
  try {
    const status = await getEmailStatus();
    res.json(status);
  } catch (error) {
    res.json({ error: error.message });
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

// TEST EMAIL ENDPOINT
router.get("/test-email", async (req, res) => {
  try {
    const alertEmail = process.env.ALERT_TO_EMAIL;
    if (!alertEmail) {
      return res.status(400).json({ error: "No ALERT_TO_EMAIL configured" });
    }
    
    // Get first email from list for testing
    const firstEmail = alertEmail.split(',')[0].trim();
    const success = await sendTestEmail(firstEmail);
    
    if (success) {
      res.json({ ok: true, message: "Test email sent to " + firstEmail });
    } else {
      res.status(500).json({ error: "Failed to send test email" });
    }
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;