import express from "express";
import { db } from "../db.js";

const router = express.Router();

/* =============================
   WEB → SET COMMAND
   ============================= */
router.post("/command", async (req, res) => {
  const { command } = req.body;

  if (!["ON", "OFF"].includes(command)) {
    return res.status(400).json({ message: "Invalid command" });
  }

  await db.query(
    "INSERT INTO device_commands (command) VALUES (?)",
    [command]
  );

  res.json({ message: "Command sent", command });
});

/* =============================
   ESP32 → GET LATEST COMMAND
   ============================= */
router.get("/command", async (req, res) => {
  const [rows] = await db.query(
    "SELECT command FROM device_commands ORDER BY id DESC LIMIT 1"
  );

  res.json({
    command: rows.length ? rows[0].command : "OFF"
  });
});

export default router;
