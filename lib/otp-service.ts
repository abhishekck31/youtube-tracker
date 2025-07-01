// Updated OTP Service with real email integration
import { sendOTPEmail } from "./email-service"

export interface OTPResponse {
  success: boolean
  message: string
  otpId?: string
}

export interface VerifyOTPResponse {
  success: boolean
  message: string
  token?: string
}

// Simulate OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; email: string; expiresAt: number; attempts: number }>()

// Generate random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate unique OTP ID
const generateOTPId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Request OTP
export const requestOTP = async (email: string): Promise<OTPResponse> => {
  try {
    // Validate email format and domain
    if (!email.endsWith("@unacademy.com")) {
      return {
        success: false,
        message: "Only @unacademy.com email addresses are allowed",
      }
    }

    // Generate OTP and ID
    const otp = generateOTP()
    const otpId = generateOTPId()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

    // Store OTP
    otpStore.set(otpId, {
      otp,
      email,
      expiresAt,
      attempts: 0,
    })

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp)

    if (!emailResult.success) {
      return {
        success: false,
        message: emailResult.error || "Failed to send OTP. Please try again.",
      }
    }

    return {
      success: true,
      message: `OTP sent to ${email}. Please check your inbox.`,
      otpId,
    }
  } catch (error) {
    console.error("Error requesting OTP:", error)
    return {
      success: false,
      message: "An error occurred while sending OTP. Please try again.",
    }
  }
}

// Verify OTP
export const verifyOTP = async (otpId: string, enteredOTP: string): Promise<VerifyOTPResponse> => {
  try {
    const otpData = otpStore.get(otpId)

    if (!otpData) {
      return {
        success: false,
        message: "Invalid or expired OTP session. Please request a new OTP.",
      }
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(otpId)
      return {
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      }
    }

    // Check attempt limit
    if (otpData.attempts >= 3) {
      otpStore.delete(otpId)
      return {
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      }
    }

    // Verify OTP
    if (otpData.otp !== enteredOTP) {
      otpData.attempts += 1
      otpStore.set(otpId, otpData)

      return {
        success: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
      }
    }

    // OTP verified successfully
    otpStore.delete(otpId)

    // Generate session token (in production, use JWT or similar)
    const token = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`

    return {
      success: true,
      message: "OTP verified successfully!",
      token,
    }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return {
      success: false,
      message: "An error occurred while verifying OTP. Please try again.",
    }
  }
}

// Resend OTP
export const resendOTP = async (email: string): Promise<OTPResponse> => {
  // Clean up any existing OTPs for this email
  for (const [key, value] of otpStore.entries()) {
    if (value.email === email) {
      otpStore.delete(key)
    }
  }

  // Request new OTP
  return await requestOTP(email)
}

// Clean up expired OTPs (run periodically)
export const cleanupExpiredOTPs = () => {
  const now = Date.now()
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key)
    }
  }
}

// Auto cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)
