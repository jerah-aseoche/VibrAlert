import mongoose from 'mongoose';

const detectionSensorLogSchema = new mongoose.Schema({
  source: { type: String, default: 'sensor' },
  event: { type: String, default: 'TRIGGERED' },
  status: { type: String, default: 'ACTIVE' },
  details: { type: String },
  event_id: { type: String, unique: true, sparse: true },
  occurred_offline: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

export default mongoose.model('DetectionSensorLog', detectionSensorLogSchema);