import express from "express";
import { db } from "../db.js";

const router = express.Router();

/* =============================
   ESP32 → SENSOR LOG
   ============================= */
router.post("/sensor-log", async (req, res) => {
  const { message } = req.body;

  await db.query(
    "INSERT INTO detection_logs (source, message) VALUES ('SENSOR', ?)",
    [message]
  );

  res.json({ success: true });
});

/* =============================
   WEB / BUTTON → BYPASS LOG
   ============================= */
router.post("/bypass-log", async (req, res) => {
  const { message } = req.body;

  await db.query(
    "INSERT INTO detection_logs (source, message) VALUES ('BYPASS', ?)",
    [message]
  );

  res.json({ success: true });
});

/* =============================
   FETCH LOGS
   ============================= */
router.get("/logs/:type", async (req, res) => {
  const type = req.params.type.toUpperCase();

  const [rows] = await db.query(
    "SELECT message, created_at FROM detection_logs WHERE source = ? ORDER BY id DESC LIMIT 20",
    [type]
  );

  res.json(rows);
});

export default router;
