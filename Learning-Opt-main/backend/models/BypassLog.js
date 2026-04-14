import mongoose from 'mongoose';

const bypassLogSchema = new mongoose.Schema({
  action: { type: String },
  source: { type: String },
  status: { type: String, default: 'SUCCESS' },
  details: { type: String },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

export default mongoose.model('BypassLog', bypassLogSchema);