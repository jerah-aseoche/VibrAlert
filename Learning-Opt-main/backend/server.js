import "dotenv/config";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import deviceRoutes from "./routes/device.js";

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

wss.on("connection", (ws) => {
  console.log("✅ ESP32 CONNECTED");
  espSocket = ws;

  ws.on("close", () => {
    console.log("❌ ESP32 DISCONNECTED");
    espSocket = null;
  });
});

export function sendCommand(cmd) {
  if (!espSocket) {
    console.warn("⚠️ ESP32 NOT CONNECTED:", cmd);
    return false;
  }

  // ✅ keep your chosen format
  espSocket.send(JSON.stringify({ COMMAND: cmd }));
  return true;
}

server.listen(3000, () => {
  console.log("🚀 Backend running on port 3000");
});
