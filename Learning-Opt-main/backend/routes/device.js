import express from "express";
import { db } from "../db.js";

const router = express.Router();

/* =========================
   WEB BYPASS (CONTROL + LOG)
   ========================= */
router.post("/bypass/on", async (req, res) => {
  try {
    // Control device
    await db.query(
      "INSERT INTO device_commands (command, source) VALUES (?, ?)",
      ["ON", "web"]
    );

    // Log bypass
    await db.query(
      "INSERT INTO detection_bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
      ["web", "ON", "SUCCESS", "Web bypass activated"]
    );

    res.json({ message: "Web bypass ON" });
  } catch (err) {
    console.error("BYPASS ON ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/bypass/off", async (req, res) => {
  try {
    // Control device
    await db.query(
      "INSERT INTO device_commands (command, source) VALUES (?, ?)",
      ["OFF", "web"]
    );

    // Log bypass
    await db.query(
      "INSERT INTO detection_bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
      ["web", "OFF", "SUCCESS", "Web bypass deactivated"]
    );

    res.json({ message: "Web bypass OFF" });
  } catch (err) {
    console.error("BYPASS OFF ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ESP / DEVICE COMMAND POLL
   ========================= */
router.get("/command", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT command FROM device_commands ORDER BY id DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return res.json({ command: "NONE" });
    }

    res.json({ command: rows[0].command });
  } catch (err) {
    console.error("COMMAND FETCH ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   SENSOR LOGS (PENDULUM)
   ========================= */
router.post("/sensor-logs", async (req, res) => {
  try {
    const { event, status, details } = req.body;

    await db.query(
      "INSERT INTO detection_sensor_logs (event, status, details) VALUES (?, ?, ?)",
      [event, status, details]
    );

    res.json({ message: "Sensor log saved" });
  } catch (err) {
    console.error("SENSOR LOG ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   SYSTEM / DETECTION LOGS
   ========================= */
router.post("/detection-logs", async (req, res) => {
  try {
    const { event, status, details } = req.body;

    await db.query(
      "INSERT INTO detection_logs (event, status, details) VALUES (?, ?, ?)",
      [event, status, details]
    );

    res.json({ message: "Detection log saved" });
  } catch (err) {
    console.error("DETECTION LOG ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CLEAR COMMANDS (OPTIONAL)
   ========================= */
router.delete("/command", async (req, res) => {
  try {
    await db.query("DELETE FROM device_commands");
    res.json({ message: "Commands cleared" });
  } catch (err) {
    console.error("CLEAR COMMAND ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
