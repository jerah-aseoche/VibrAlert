import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  ALERT_TO_EMAIL,
  ALERT_FROM_NAME,
  ALERT_COOLDOWN_SEC,
} = process.env;

export const mailerEnabled =
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && ALERT_TO_EMAIL;

const transporter = mailerEnabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === "true", // true for 465
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

// Simple cooldown to avoid spam if sensor triggers repeatedly
let lastSentAt = 0;

export async function sendSensorTriggerEmail(payload) {
  if (!mailerEnabled) {
    return { ok: false, skipped: true, reason: "mailer not configured" };
  }

  const cooldownMs = Number(ALERT_COOLDOWN_SEC || 0) * 1000;
  const now = Date.now();
  if (cooldownMs > 0 && now - lastSentAt < cooldownMs) {
    return { ok: false, skipped: true, reason: "cooldown" };
  }

  const toList = ALERT_TO_EMAIL.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const {
    details,
    created_at,
    baseline_rms_g,
    threshold_g,
    event_mean_rms_g,
    event_peak_rms_g,
    mpu_hits,
    pendulum_hits,
    detection_log_id,
  } = payload || {};

  const subject = `VibrAlert Alert: Sensor Trigger Detected`;

  const text =
`VibrAlert sensor trigger detected.

Detection Log ID: ${detection_log_id ?? "N/A"}
Time: ${created_at || new Date().toISOString()}
Details: ${details || "N/A"}

Telemetry (g):
- Baseline RMS: ${baseline_rms_g ?? "N/A"}
- Threshold: ${threshold_g ?? "N/A"}
- Event Mean RMS: ${event_mean_rms_g ?? "N/A"}
- Event Peak RMS: ${event_peak_rms_g ?? "N/A"}

Counts:
- MPU hits: ${mpu_hits ?? "N/A"}
- Pendulum hits: ${pendulum_hits ?? "N/A"}

Sent by the local VibrAlert backend.`;

  await transporter.sendMail({
    from: `"${ALERT_FROM_NAME || "VibrAlert"}" <${SMTP_USER}>`,
    to: toList,
    subject,
    text,
  });

  lastSentAt = now;
  return { ok: true };
}
