import express from "express";
import { db } from "../db.js";

const router = express.Router();

/* =============================
   WEB → SEND COMMAND
   ============================= */
router.post("/command", async (req, res) => {
  const { command } = req.body;

  if (!["ON", "OFF"].includes(command)) {
    await db.query(
      "INSERT INTO bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
      ["web", command || "UNKNOWN", "FAIL", "Invalid command"]
    );

    return res.status(400).json({ message: "Invalid command" });
  }

  try {
    // store command (ESP will poll this)
    await db.query(
      "INSERT INTO device_commands (command) VALUES (?)",
      [command]
    );

    // log SUCCESS
    await db.query(
      "INSERT INTO bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
      ["web", command, "SUCCESS", "Command sent from web"]
    );

    res.json({ message: "Command sent", command });
  } catch (err) {
    // log FAIL
    await db.query(
      "INSERT INTO bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
      ["web", command, "FAIL", err.message]
    );

    res.status(500).json({ message: "Command failed" });
  }
});

/* =============================
   GET BYPASS LOGS
   ============================= */
router.get("/bypass-logs", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM bypass_logs ORDER BY created_at DESC"
  );
  res.json(rows);
});

/* =============================
   CLEAR BYPASS LOGS
   ============================= */
router.delete("/bypass-logs", async (req, res) => {
  await db.query("DELETE FROM bypass_logs");
  res.json({ message: "Bypass logs cleared" });
});

let currentCommand = "NONE";

router.post("/command/on", async (req, res) => {
  currentCommand = "ON";

  await db.query(
    "INSERT INTO bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
    ["web", "ON", "SUCCESS", "Manual control ON from web"]
  );

  res.json({ message: "ON command issued" });
});

router.post("/command/off", async (req, res) => {
  currentCommand = "OFF";

  await db.query(
    "INSERT INTO bypass_logs (source, action, status, details) VALUES (?, ?, ?, ?)",
    ["web", "OFF", "SUCCESS", "Manual control OFF from web"]
  );

  res.json({ message: "OFF command issued" });
});

router.get("/command", (req, res) => {
  res.json({ command: currentCommand });
});

export default router;
