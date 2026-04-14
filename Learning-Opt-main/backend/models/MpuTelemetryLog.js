import mongoose from 'mongoose';

const mpuTelemetryLogSchema = new mongoose.Schema({
  mode: { type: String, enum: ['CALIBRATION', 'EVENT'] },
  detection_log_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DetectionSensorLog' },
  baseline_rms_g: { type: Number },
  threshold_g: { type: Number },
  safety_factor: { type: Number },
  samples: { type: Number },
  mpu_confirmation_count: { type: Number },
  event_mean_rms_g: { type: Number },
  event_peak_rms_g: { type: Number },
  mpu_hits: { type: Number },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

export default mongoose.model('MpuTelemetryLog', mpuTelemetryLogSchema);