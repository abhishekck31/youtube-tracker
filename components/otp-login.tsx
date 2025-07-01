"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, ArrowRight, CheckCircle, RefreshCw, Clock, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { requestOTP, verifyOTP, resendOTP } from "@/lib/otp-client"

interface OTPLoginProps {
  onLoginSuccess: () => void
}

export default function OTPLogin({ onLoginSuccess }: OTPLoginProps) {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOTP] = useState("")
  const [otpId, setOtpId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)
  const { toast } = useToast()

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (step === "otp" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [step, timeLeft])

  // Enable resend after 30 seconds
  useEffect(() => {
    if (step === "otp") {
      const resendTimer = setTimeout(() => {
        setCanResend(true)
      }, 30000) // 30 seconds
      return () => clearTimeout(resendTimer)
    }
  }, [step])

  const validateEmail = (email: string) => {
    if (!email.endsWith("@unacademy.com")) {
      setEmailError("Only @unacademy.com email addresses are allowed")
      return false
    }
    setEmailError("")
    return true
  }

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await requestOTP(email)

      if (response.success) {
        setOtpId(response.otpId!)
        setStep("otp")
        setTimeLeft(300) // Reset timer
        setCanResend(false)
        toast({
          title: "OTP Sent Successfully! 🎉",
          description: response.message,
        })
      } else {
        setEmailError(response.message)
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting OTP:", error)
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyOTP(otpId, otp)

      if (response.success) {
        toast({
          title: "Welcome to Unacademy! 🎓",
          description: response.message,
        })
        // Store session token (in production, use secure storage)
        localStorage.setItem("unacademy_session", response.token!)
        onLoginSuccess()
      } else {
        setOtpError(response.message)
        toast({
          title: "Verification Failed",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)

    try {
      const response = await resendOTP(email)

      if (response.success) {
        setOtpId(response.otpId!)
        setTimeLeft(300) // Reset timer
        setCanResend(false)
        setOTP("") // Clear current OTP
        setOtpError("")
        toast({
          title: "New OTP Sent! 📧",
          description: response.message,
        })
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error resending OTP:", error)
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (step === "otp") {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="unacademy-card border-0 shadow-unacademy">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-unacademy-gray-800">Enter Verification Code</CardTitle>
            <CardDescription className="text-base text-unacademy-gray-600 mt-2">
              We've sent a 6-digit code to <span className="font-semibold text-blue-600">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="otp" className="text-unacademy-gray-700 font-semibold text-base">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setOTP(value)
                    if (otpError) setOtpError("")
                  }}
                  className={`text-center text-2xl tracking-[0.5em] font-bold h-14 rounded-xl border-2 transition-all duration-200 ${
                    otpError
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-blue-500 bg-white"
                  }`}
                  maxLength={6}
                  required
                />
                {otpError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      !
                    </div>
                    {otpError}
                  </div>
                )}
              </div>

              {/* Timer and Resend */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-unacademy-gray-600">
                  <Clock className="h-4 w-4" />
                  {timeLeft > 0 ? (
                    <span className="font-medium">Expires in {formatTime(timeLeft)}</span>
                  ) : (
                    <span className="text-red-500 font-medium">Code expired</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Resend Code
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !otp || otp.length !== 6}
                className="w-full h-12 unacademy-button text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5" />
                    Verify & Sign In
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("email")
                  setOTP("")
                  setOtpError("")
                  setTimeLeft(300)
                }}
                className="w-full text-unacademy-gray-500 hover:text-unacademy-gray-700 hover:bg-gray-50"
              >
                ← Back to email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="unacademy-card border-0 shadow-unacademy">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 unacademy-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-unacademy-gray-800">Welcome back to Unacademy</CardTitle>
          <CardDescription className="text-base text-unacademy-gray-600 mt-2">
            Enter your Unacademy email to receive a secure verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-unacademy-gray-700 font-semibold text-base">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-unacademy-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@unacademy.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError("")
                  }}
                  onBlur={() => email && validateEmail(email)}
                  className={`pl-12 h-12 rounded-xl border-2 text-base transition-all duration-200 ${
                    emailError
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-blue-500 bg-white"
                  }`}
                  required
                />
              </div>
              {emailError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    !
                  </div>
                  {emailError}
                </div>
              )}
              {email.endsWith("@unacademy.com") && !emailError && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Valid Unacademy email address</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email.endsWith("@unacademy.com")}
              className="w-full h-12 unacademy-button text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Code...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5" />
                  Send Verification Code
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-3 text-sm text-unacademy-gray-500">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Secure OTP-based authentication</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
