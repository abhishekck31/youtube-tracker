import { type NextRequest, NextResponse } from "next/server"
import { sendOTPEmail } from "@/lib/email-service"

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
      message: `OTP sent to ${email}. Please check your inbox.`,
      otpId,
    })
  } catch (error) {
    console.error("Error requesting OTP:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while sending OTP. Please try again.",
      },
      { status: 500 },
    )
  }
}

// Export the otpStore for use in verify endpoint
export { otpStore }
