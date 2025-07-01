import { NextResponse } from "next/server"
import { sendOTPEmail, testEmailConfig } from "@/lib/email-service"

export async function GET() {
  try {
    console.log("🔧 Testing email configuration...")

    // Test email config first
    const configTest = await testEmailConfig()
    console.log("📋 Config test result:", configTest)

    if (!configTest.success) {
      return NextResponse.json({
        success: false,
        error: "Email configuration failed",
        details: configTest.error,
        suggestion: "Check your environment variables in .env.local",
      })
    }

    // Test sending OTP
    console.log("📧 Testing OTP email send...")
    const testOTP = "123456"
    const testEmail = "ext-ck.abhishek@unacademy.com"

    const emailResult = await sendOTPEmail(testEmail, testOTP)
    console.log("📬 Email send result:", emailResult)

    return NextResponse.json({
      success: true,
      message: "Email service test completed successfully",
      configTest,
      emailTest: emailResult,
      environment: process.env.NODE_ENV,
      emailService: process.env.EMAIL_SERVICE || "gmail",
    })
  } catch (error) {
    console.error("❌ Email test error:", error)
    return NextResponse.json({
      success: false,
      error: "Email test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      suggestion: "Check server logs for more details",
    })
  }
}
