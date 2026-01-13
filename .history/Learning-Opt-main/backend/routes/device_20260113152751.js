import express from "express";
import { db } from "../db.js";

const router = express.Router();

/* ============================
   SENSOR LOGS (ESP32)
   ============================ */
router.post("/sensor-log", async (req, res) => {
  const { event, status, details } = req.body;

  await db.query(
    "INSERT INTO detection_sensor_logs (event, status, details) VALUES (?, ?, ?)",
    [event, status, details || null]
  );

  res.json({ message: "Sensor log saved" });
});

/* ============================
   BYPASS LOGS (WEB + PHYSICAL)
   ============================ */
router.post("/bypass-log", async (req, res) => {
  const { source, action, status, details } = req.body;

  await db.query(
    "INSERT INTO detection_bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
    [source, action, status, details || null]
  );

  res.json({ message: "Bypass log saved" });
});

/* ============================
   MANUAL COMMAND (WEB)
   ============================ */
router.post("/command", async (req, res) => {
  const { command } = req.body;

  if (!["ON", "OFF"].includes(command)) {
    return res.status(400).json({ message: "Invalid command" });
  }

  await db.query(
    "INSERT INTO detection_bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
    ["web", command, "SUCCESS", "Command sent from web"]
  );

  res.json({ message: "Command sent" });
});

export default router;
