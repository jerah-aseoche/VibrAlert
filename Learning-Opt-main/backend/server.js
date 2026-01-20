import "dotenv/config";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import deviceRoutes from "./routes/device.js";
import { db } from "./db.js";

console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("ALERT_TO_EMAIL:", process.env.ALERT_TO_EMAIL);
console.log("mailer enabled:", Boolean(process.env.SMTP_PASS));

const app = express();
app.use(express.json());
app.use("/api/device", deviceRoutes);

const server = http.createServer(app);

/* ───────── ESP32 WEBSOCKET ───────── */
const wss = new WebSocketServer({ server });
let espSocket = null;

// How often we ping WS clients
const WS_PING_INTERVAL_MS = 5000;
// How long before we consider device stale (no heartbeat / no WS activity)
const STALE_MS = 15000;

async function setDeviceState({ online, wsConnected, ip = null }) {
  // online/wsConnected are 0/1
  await db.query(
    `UPDATE system_state
     SET device_online=?,
         ws_connected=?,
         device_last_seen=NOW(),
         device_ip=COALESCE(?, device_ip),
         updated_at=NOW()
     WHERE id=1`,
    [online ? 1 : 0, wsConnected ? 1 : 0, ip]
  );
}

async function markDeviceOfflineIfStale() {
  // If device_last_seen is older than STALE_MS, mark offline.
  // This covers cases where WiFi drops but WS never closes cleanly.
  await db.query(
    `UPDATE system_state
     SET device_online=0,
         ws_connected=0,
         updated_at=NOW()
     WHERE id=1
       AND (device_last_seen IS NULL OR device_last_seen < (NOW() - INTERVAL ? SECOND))`,
    [Math.ceil(STALE_MS / 1000)]
  );
}

wss.on("connection", async (ws, req) => {
  console.log("✅ ESP32 CONNECTED (WS)");
  espSocket = ws;

  // Mark alive flags
  ws.isAlive = true;

  // Best effort: get the remote IP
  const ip =
    req?.socket?.remoteAddress?.replace("::ffff:", "") ||
    req?.headers?.["x-forwarded-for"] ||
    null;

  try {
    await setDeviceState({ online: true, wsConnected: true, ip });
  } catch (e) {
    console.error("DB_UPDATE_ON_WS_CONNECT_FAILED", e?.message || e);
  }

  ws.on("pong", async () => {
    ws.isAlive = true;
    // Update last_seen on pong so UI stays online even without heartbeats/logs
    try {
      await db.query(
        `UPDATE system_state
         SET device_online=1, ws_connected=1, device_last_seen=NOW(), updated_at=NOW()
         WHERE id=1`
      );
    } catch (e) {
      // keep quiet to avoid spam
    }
  });

  ws.on("close", async () => {
    console.log("❌ ESP32 DISCONNECTED (WS)");
    if (espSocket === ws) espSocket = null;

    try {
      await db.query(
        `UPDATE system_state
         SET ws_connected=0,
             device_online=0,
             updated_at=NOW()
         WHERE id=1`
      );
    } catch (e) {
      console.error("DB_UPDATE_ON_WS_CLOSE_FAILED", e?.message || e);
    }
  });

  ws.on("error", (err) => {
    console.error("WS_ERROR", err?.message || err);
  });
});

// Ping/pong watchdog: terminates half-open sockets
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      try { ws.terminate(); } catch {}
      return;
    }
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  });
}, WS_PING_INTERVAL_MS);

// DB stale check
setInterval(() => {
  markDeviceOfflineIfStale().catch(() => {});
}, 3000);

export function sendCommand(cmd) {
  if (!espSocket || espSocket.readyState !== 1) {
    console.warn("⚠️ ESP32 NOT CONNECTED:", cmd);
    return false;
  }
  espSocket.send(JSON.stringify({ COMMAND: cmd }));
  return true;
}

// IMPORTANT: listen on 0.0.0.0 for hotspot/LAN access
server.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Backend running on 0.0.0.0:3000");
});
