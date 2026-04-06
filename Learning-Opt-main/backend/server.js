import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import deviceRoutes from "./routes/device.js";

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use("/api/device", deviceRoutes);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server on the SAME port
const wss = new WebSocketServer({ 
  server,  // ← Critical: attach to existing server
  path: '/'  // ← WebSocket endpoint
});

let espSocket = null;

wss.on('connection', (ws, req) => {
  console.log('✅ ESP32 WebSocket Connected!');
  console.log(`📡 Client: ${req.socket.remoteAddress}`);
  espSocket = ws;
  
  ws.on('message', (data) => {
    console.log('📨 Received from ESP32:', data.toString());
  });
  
  ws.on('close', () => {
    console.log('❌ ESP32 Disconnected');
    espSocket = null;
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to VibrAlert backend' }));
});

export function sendCommand(cmd) {
  if (!espSocket || espSocket.readyState !== 1) {
    console.warn(`⚠️ ESP32 NOT CONNECTED - Cannot send: ${cmd}`);
    return false;
  }
  
  espSocket.send(JSON.stringify({ COMMAND: cmd }));
  console.log(`✅ Command sent to ESP32: ${cmd}`);
  return true;
}

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 WebSocket available at ws://0.0.0.0:${PORT}/`);
});