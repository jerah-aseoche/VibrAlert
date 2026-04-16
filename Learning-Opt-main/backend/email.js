import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend (Cloud)
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize SMTP transporter (Local fallback)
let smtpTransporter = null;
let smtpAvailable = false;

// Configure SMTP (for local fallback)
function initSMTP() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    });
    smtpAvailable = true;
    console.log('📧 SMTP fallback configured');
  } else {
    console.log('⚠️ SMTP not configured - cloud email only');
  }
}

// Check if SMTP is working
async function checkSMTPAvailability() {
  if (!smtpTransporter) return false;
  try {
    await smtpTransporter.verify();
    return true;
  } catch (error) {
    console.log('SMTP not available:', error.message);
    return false;
  }
}

// Determine severity based on vibration data
function determineSeverity(event_peak_rms_g, threshold_g) {
  if (typeof event_peak_rms_g === 'number' && typeof threshold_g === 'number') {
    if (event_peak_rms_g >= threshold_g * 1.5) {
      return 'red'; // Evacuation level
    }
  }
  return 'orange'; // Warning level
}

// Generate email content based on severity
function generateEmailContent(severity, eventData) {
  const {
    event_id,
    created_at,
    event_mean_rms_g,
    event_peak_rms_g,
    threshold_g,
    baseline_rms_g,
    occurred_offline,
    detection_log_id
  } = eventData;

  const timestamp = created_at ? new Date(created_at).toLocaleString() : new Date().toLocaleString();
  const meanValue = event_mean_rms_g?.toFixed(6) || 'N/A';
  const peakValue = event_peak_rms_g?.toFixed(6) || 'N/A';
  const thresholdValue = threshold_g?.toFixed(6) || 'N/A';
  const baselineValue = baseline_rms_g?.toFixed(6) || 'N/A';

  if (severity === 'orange') {
    return {
      subject: '🔔 VibrAlert Event Detected – 🟠 Warning',
      text: `
Legend of Warning Levels:
🟢 – Normal: No action required
🟠 – Alert: Stay cautious, follow safety protocols
🔴 – Evacuate: Immediate evacuation required

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VibrAlert 🟠 WARNING Detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear Faculty and Students,

At ${timestamp}, the system recorded a vibration level of ${peakValue}g, confirming that the threshold (${thresholdValue}g) has been exceeded.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Event ID: ${event_id || detection_log_id || 'N/A'}
• Time: ${timestamp}
• Peak Vibration: ${peakValue} g
• Mean Vibration: ${meanValue} g
• Threshold: ${thresholdValue} g
• Baseline: ${baselineValue} g
${occurred_offline ? '• ⚠️ Event occurred while device was offline\n' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ POSSIBLE TRIGGERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Minor mechanical vibration or imbalance
• Temporary environmental disturbance
• Sensor sensitivity fluctuation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👨‍🏫 FACULTY/ADMIN ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Survey the building and school grounds for irregularities
2. Check classrooms and common areas for safety concerns
3. Monitor the affected area for recurring vibrations
4. Coordinate with maintenance staff for further inspection
5. Keep communication lines open for updates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 EMERGENCY PREPAREDNESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Faculty and officers should have essential emergency items readily accessible:
• Flashlight for visibility
• First aid kit for immediate medical needs
• Emergency contact list for communication
• Bottled water to sustain everyone during extended safety procedures

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stay cautious and follow safety protocols.

Thank you for your cooperation.

Best regards,
VibrAlert Safety Monitoring Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View Dashboard: ${process.env.FRONTEND_URL || 'https://vibralert-frontend.vercel.app'}
      `,
    };
  } else {
    return {
      subject: '🔔 VibrAlert Event Detected – 🔴 EVACUATION',
      text: `
Legend of Warning Levels:
🟢 – Normal: No action required
🟠 – Alert: Stay cautious, follow safety protocols
🔴 – Evacuate: Immediate evacuation required

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 VIBRALERT 🔴 EVACUATION ALERT 🚨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMMEDIATE EVACUATION REQUIRED ⚠️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

At ${timestamp}, the system recorded a critical vibration level of ${peakValue}g, 
exceeding the warning threshold (${thresholdValue}g) by a significant margin.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Event ID: ${event_id || detection_log_id || 'N/A'}
• Time: ${timestamp}
• Peak Vibration: ${peakValue} g
• Mean Vibration: ${meanValue} g
• Threshold: ${thresholdValue} g
• Baseline: ${baselineValue} g
${occurred_offline ? '• ⚠️ Event occurred while device was offline\n' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ POSSIBLE TRIGGERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Severe mechanical failure or imbalance
• Significant environmental disturbance
• Critical structural anomaly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 IMMEDIATE ACTIONS REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACULTY AND ADMINISTRATORS MUST:

1. 🏃 EVACUATE all students from classrooms and common areas immediately
2. 🚪 SECURE all exits and guide students to designated evacuation points
3. ♿ ASSIST individuals with special needs during evacuation
4. 📢 COORDINATE with safety and maintenance personnel for immediate response
5. 📡 ENSURE communication lines remain open for updates and instructions
6. 🚫 KEEP everyone away from the affected area entirely

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 EMERGENCY SUPPLIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ensure essential emergency items are readily accessible:
• Flashlight for visibility
• First aid kit for immediate medical needs
• Emergency contact list for communication
• Bottled water for hydration
• Emergency blankets for vulnerable individuals
• Portable radios for ongoing safety instructions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT RETURN TO THE AREA UNTIL AUTHORITIES DECLARE IT SAFE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your cooperation and immediate action.

Best regards,
VibrAlert Safety Monitoring Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View Dashboard: ${process.env.FRONTEND_URL || 'https://vibralert-frontend.vercel.app'}
      `,
    };
  }
}

// Send email via Resend (Cloud)
async function sendViaResend(to, subject, text) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    
    console.log('✅ Email sent via Resend (Cloud):', data?.id);
    return true;
  } catch (error) {
    console.error('Resend exception:', error.message);
    return false;
  }
}

// Send email via SMTP (Local fallback)
async function sendViaSMTP(to, subject, text) {
  if (!smtpTransporter) return false;
  
  try {
    const info = await smtpTransporter.sendMail({
      from: `${process.env.ALERT_FROM_NAME || "VibrAlert"} <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: text,
    });
    
    console.log('✅ Email sent via SMTP (Local):', info.messageId);
    return true;
  } catch (error) {
    console.error('SMTP error:', error.message);
    return false;
  }
}

// Main dual-mode email sender with severity levels
export async function sendSensorTriggerEmail(eventData) {
  const {
    event_id,
    detection_log_id,
    created_at,
    event_mean_rms_g,
    event_peak_rms_g,
    threshold_g,
    baseline_rms_g,
    occurred_offline
  } = eventData;

  // Get recipient email(s)
  const toList = process.env.ALERT_TO_EMAIL?.split(',').map(s => s.trim()).filter(Boolean) || [];
  if (toList.length === 0) {
    console.log('⚠️ No ALERT_TO_EMAIL configured');
    return { ok: false, skipped: true, reason: "no recipients" };
  }

  // Check cooldown to avoid spam
  const cooldownSec = Number(process.env.ALERT_COOLDOWN_SEC) || 60;
  
  // Determine severity
  const severity = determineSeverity(event_peak_rms_g, threshold_g);
  const { subject, text } = generateEmailContent(severity, {
    event_id,
    detection_log_id,
    created_at,
    event_mean_rms_g,
    event_peak_rms_g,
    threshold_g,
    baseline_rms_g,
    occurred_offline
  });

  console.log(`📧 Sending ${severity.toUpperCase()} level alert email...`);

  // Try cloud first (Resend)
  let emailSent = false;
  
  for (const to of toList) {
    // Try Resend
    const resendSuccess = await sendViaResend(to, subject, text);
    if (resendSuccess) {
      emailSent = true;
      continue;
    }
    
    // Fallback to SMTP
    const smtpSuccess = await sendViaSMTP(to, subject, text);
    if (smtpSuccess) {
      emailSent = true;
    }
  }

  if (emailSent) {
    console.log(`✅ ${severity.toUpperCase()} alert email sent successfully`);
    return { ok: true, severity };
  } else {
    console.error('❌ Failed to send email via both methods');
    return { ok: false, error: "both methods failed" };
  }
}

// Test email endpoint
export async function sendTestEmail(to) {
  const testData = {
    event_id: 'TEST-' + Date.now(),
    created_at: new Date().toISOString(),
    event_mean_rms_g: 0.5,
    event_peak_rms_g: 1.2,
    threshold_g: 0.8,
    baseline_rms_g: 0.16,
    occurred_offline: false
  };

  const severity = determineSeverity(1.2, 0.8);
  const { subject, text } = generateEmailContent(severity, testData);

  // Try Resend first
  const resendSuccess = await sendViaResend(to, subject, text);
  if (resendSuccess) {
    return true;
  }
  
  // Fallback to SMTP
  return await sendViaSMTP(to, subject, text);
}

// Initialize SMTP on module load
initSMTP();

// Export email status checker
export async function getEmailStatus() {
  const smtpWorking = await checkSMTPAvailability();
  return {
    resendConfigured: !!process.env.RESEND_API_KEY,
    smtpConfigured: smtpAvailable,
    smtpWorking: smtpWorking
  };
}