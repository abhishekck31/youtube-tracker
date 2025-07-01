// Client-side OTP service that calls API routes
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

// Request OTP via API route
export const requestOTP = async (email: string): Promise<OTPResponse> => {
  try {
    const response = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error requesting OTP:", error)
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    }
  }
}

// Verify OTP via API route
export const verifyOTP = async (otpId: string, otp: string): Promise<VerifyOTPResponse> => {
  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otpId, otp }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    }
  }
}

// Resend OTP via API route
export const resendOTP = async (email: string): Promise<OTPResponse> => {
  try {
    const response = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error resending OTP:", error)
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    }
  }
}
