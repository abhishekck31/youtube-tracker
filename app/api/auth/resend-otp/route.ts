import { type NextRequest, NextResponse } from "next/server"
import { sendOTPEmail } from "@/lib/email-service"
import { otpStore } from "../request-otp/route"

// Generate random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate unique OTP ID
const generateOTPId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email format and domain
    if (!email || !email.endsWith("@unacademy.com")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only @unacademy.com email addresses are allowed",
        },
        { status: 400 },
      )
    }

    // Clean up any existing OTPs for this email
    for (const [key, value] of otpStore.entries()) {
      if (value.email === email) {
        otpStore.delete(key)
      }
    }

    // Generate new OTP and ID
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
      return NextResponse.json(
        {
          success: false,
          message: emailResult.error || "Failed to send OTP. Please try again.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `New OTP sent to ${email}. Please check your inbox.`,
      otpId,
    })
  } catch (error) {
    console.error("Error resending OTP:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while sending OTP. Please try again.",
      },
      { status: 500 },
    )
  }
}
