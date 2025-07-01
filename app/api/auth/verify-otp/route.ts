import { type NextRequest, NextResponse } from "next/server"
import { otpStore } from "../request-otp/route"

export async function POST(request: NextRequest) {
  try {
    const { otpId, otp } = await request.json()

    if (!otpId || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP ID and OTP are required",
        },
        { status: 400 },
      )
    }

    const otpData = otpStore.get(otpId)

    if (!otpData) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired OTP session. Please request a new OTP.",
        },
        { status: 400 },
      )
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(otpId)
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        },
        { status: 400 },
      )
    }

    // Check attempt limit
    if (otpData.attempts >= 3) {
      otpStore.delete(otpId)
      return NextResponse.json(
        {
          success: false,
          message: "Too many failed attempts. Please request a new OTP.",
        },
        { status: 400 },
      )
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1
      otpStore.set(otpId, otpData)

      return NextResponse.json(
        {
          success: false,
          message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
        },
        { status: 400 },
      )
    }

    // OTP verified successfully
    otpStore.delete(otpId)

    // Generate session token (in production, use JWT or similar)
    const token = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully!",
      token,
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while verifying OTP. Please try again.",
      },
      { status: 500 },
    )
  }
}
