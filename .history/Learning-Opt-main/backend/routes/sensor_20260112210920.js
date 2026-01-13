const express = require('express');
const router = express.Router();
const db = require('../db');

// 1️⃣ Receive ESP32 data
router.post('/data', async (req, res) => {
  try {
    const { sensor_id, acc_x, acc_y, acc_z, rms } = req.body;
    if (!sensor_id || acc_x === undefined || acc_y === undefined || acc_z === undefined || rms === undefined) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const sql = 'INSERT INTO sensor_data (sensor_id, acc_x, acc_y, acc_z, rms) VALUES (?, ?, ?, ?, ?)';
    await db.execute(sql, [sensor_id, acc_x, acc_y, acc_z, rms]);

    res.status(200).json({ message: 'Data saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2️⃣ Get all data
router.get('/data', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sensor_data ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3️⃣ Get latest N entries (for live chart)
router.get('/data/latest/:count', async (req, res) => {
  const count = parseInt(req.params.count) || 50;
  try {
    const [rows] = await db.query('SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT ?', [count]);
    res.json(rows.reverse()); // reverse for chronological order
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
