// Email service integration for sending OTPs - SERVER SIDE ONLY
import nodemailer from "nodemailer"

// Detect whether we are in a real Node.js server (production) or a
// browser‐simulated environment like next-lite / Vercel preview.
const inLocalPreview = process.env.NODE_ENV !== "production"

// Email service configuration
interface EmailConfig {
  service?: string
  host?: string
  port?: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}

// Gmail configuration (easiest for development)
const getGmailConfig = (): EmailConfig => ({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "", // your-email@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD || "", // App password from Google
  },
})

// SendGrid configuration (recommended for production)
const getSendGridConfig = (): EmailConfig => ({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY || "",
  },
})

// Custom SMTP configuration
const getCustomSMTPConfig = (): EmailConfig => ({
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
})

// Get email configuration based on environment
const getEmailConfig = (): EmailConfig => {
  const emailService = process.env.EMAIL_SERVICE || "gmail"

  switch (emailService) {
    case "sendgrid":
      return getSendGridConfig()
    case "smtp":
      return getCustomSMTPConfig()
    case "gmail":
    default:
      return getGmailConfig()
  }
}

// Create transporter with correct nodemailer syntax
const createTransporter = () => {
  const config = getEmailConfig()

  // Use nodemailer.createTransport (not createTransporter)
  return nodemailer.createTransport({
    service: config.service,
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  })
}

// Email templates
const getOTPEmailTemplate = (otp: string, email: string) => {
  return {
    subject: "Unacademy YouTube Tracker - Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unacademy OTP Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #059669; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 8px; font-family: monospace; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Unacademy</h1>
            <h2>YouTube Analytics Hub</h2>
            <p>Verification Code</p>
          </div>
          <div class="content">
            <h3>Hello!</h3>
            <p>You requested access to the Unacademy YouTube Analytics Hub. Please use the verification code below to complete your login:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Valid for 5 minutes</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This code expires in 5 minutes</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
                <li>Only Unacademy team members can access this system</li>
              </ul>
            </div>
            
            <p><strong>Requested for:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            
            <p>If you're having trouble accessing the system, please contact your administrator.</p>
          </div>
          <div class="footer">
            <p>© 2024 Unacademy. This is an automated message for YouTube Analytics Hub access.</p>
            <p>🔒 Secure • 📊 Analytics • 🎯 Performance Tracking</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Unacademy YouTube Analytics Hub - Verification Code

Hello!

You requested access to the Unacademy YouTube Analytics Hub.

Your verification code is: ${otp}

This code expires in 5 minutes.

Security Notice:
- Never share this code with anyone
- If you didn't request this code, please ignore this email
- Only Unacademy team members can access this system

Requested for: ${email}
Time: ${new Date().toLocaleString()}

© 2024 Unacademy
    `,
  }
}

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  // In preview / dev we never hit Nodemailer (avoids dns.lookup & other Node APIs)
  if (inLocalPreview) {
    console.log(`
🔐 DEV/PREVIEW OTP
==================
To: ${email}
OTP: ${otp}
Valid: 5 min
==================`)
    return { success: true }
  }

  try {
    const config = getEmailConfig()
    const transporter = createTransporter()
    const template = getOTPEmailTemplate(otp, email)

    const result = await transporter.sendMail({
      from: { name: "Unacademy YouTube Analytics", address: config.auth.user },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    console.log("✅ OTP email sent:", result.messageId)
    return { success: true }
  } catch (error) {
    console.error("❌ OTP email error:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Test email configuration
export const testEmailConfig = async (): Promise<{ success: boolean; error?: string }> => {
  if (inLocalPreview) {
    console.log("⚠️  Skipping transporter.verify() in preview. Assuming success.")
    return { success: true }
  }

  try {
    const transporter = createTransporter()
    await transporter.verify()
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
