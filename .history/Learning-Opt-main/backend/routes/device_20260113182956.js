import express from "express";
import { db } from "../db.js";

const router = express.Router();

/* =========================
   WEB BYPASS (CONTROL + LOG)
   ========================= */
router.post("/bypass/on", async (req, res) => {
  await db.query("INSERT INTO device_commands (command) VALUES ('ON')");

  await db.query(
    "INSERT INTO detection_bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
    ["web", "ON", "SUCCESS", "Web bypass ON"]
  );

  res.json({ message: "Web bypass ON" });
});

router.post("/bypass/off", async (req, res) => {
  await db.query("INSERT INTO device_commands (command) VALUES ('OFF')");

  await db.query(
    "INSERT INTO detection_bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
    ["web", "OFF", "SUCCESS", "Web bypass OFF"]
  );

  res.json({ message: "Web bypass OFF" });
});

/* =========================
   ESP / DEVICE COMMAND POLL
   ========================= */
router.get("/command", async (req, res) => {
  const [rows] = await db.query(
    "SELECT command FROM device_commands ORDER BY id DESC LIMIT 1"
  );

  if (rows.length === 0) {
    return res.json({ command: "NONE" });
  }

  res.json({ command: rows[0].command });
});

/* =========================
   SENSOR LOGS (PENDULUM)
   ========================= */
router.post("/sensor-logs", async (req, res) => {
  const { event, status, details } = req.body;

  await db.query(
    "INSERT INTO detection_sensor_logs (event, status, details) VALUES (?, ?, ?)",
    [event, status, details]
  );

  res.json({ message: "Sensor log saved" });
});

/* =========================
   SYSTEM / DETECTION LOGS
   ========================= */
router.post("/detection-logs", async (req, res) => {
  const { event, status, details } = req.body;

  await db.query(
    "INSERT INTO detection_logs (event, status, details) VALUES (?, ?, ?)",
    [event, status, details]
  );

  res.json({ message: "Detection log saved" });
});

router.delete("/command", async (req, res) => {
  await db.query("DELETE FROM device_commands");
  res.json({ message: "Commands cleared" });
});

export default router;
