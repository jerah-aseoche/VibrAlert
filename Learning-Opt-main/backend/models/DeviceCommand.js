import mongoose from 'mongoose';

const deviceCommandSchema = new mongoose.Schema({
  command: { type: String, enum: ['ON', 'OFF'] },
  source: { type: String, enum: ['web', 'physical'] },
  consumed: { type: Boolean, default: false },
  status: { type: String },
  event: { type: String },
  details: { type: String },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

export default mongoose.model('DeviceCommand', deviceCommandSchema);