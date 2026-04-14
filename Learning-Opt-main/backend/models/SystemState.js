import mongoose from 'mongoose';

const systemStateSchema = new mongoose.Schema({
  id: { type: Number, default: 1, unique: true },
  alarm_status: { type: String, default: 'OFF' },
  last_event: { type: String },
  last_source: { type: String },
  device_online: { type: Boolean, default: false },
  ws_connected: { type: Boolean, default: false },
  device_last_seen: { type: Date },
  device_ip: { type: String },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

export default mongoose.model('SystemState', systemStateSchema);