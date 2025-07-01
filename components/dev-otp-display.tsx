"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DevOTPDisplayProps {
  show: boolean
}

export default function DevOTPDisplay({ show }: DevOTPDisplayProps) {
  const [otpLogs, setOtpLogs] = useState<Array<{ email: string; otp: string; timestamp: Date }>>([])
  const [isVisible, setIsVisible] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!show) return

    // Check if we're in development mode by checking if we can access window
    const isDevelopment = typeof window !== "undefined" && window.location.hostname === "localhost"

    if (!isDevelopment) return

    // Listen for console logs (this is a development helper)
    const originalLog = console.log
    console.log = (...args) => {
      originalLog(...args)

      // Check if this is an OTP log
      const logString = args.join(" ")
      if (logString.includes("DEVELOPMENT MODE - OTP EMAIL")) {
        // Parse the OTP info from console log
        const emailMatch = logString.match(/To: (.+@unacademy\.com)/)
        const otpMatch = logString.match(/OTP: (\d{6})/)

        if (emailMatch && otpMatch) {
          setOtpLogs((prev) => [
            {
              email: emailMatch[1],
              otp: otpMatch[1],
              timestamp: new Date(),
            },
            ...prev.slice(0, 4),
          ]) // Keep only last 5 OTPs
        }
      }
    }

    return () => {
      console.log = originalLog
    }
  }, [show])

  const copyOTP = (otp: string) => {
    navigator.clipboard.writeText(otp)
    toast({
      title: "Copied!",
      description: "OTP copied to clipboard",
    })
  }

  // Only show in development environment
  if (!show || typeof window === "undefined" || window.location.hostname !== "localhost") {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-slate-900 text-white border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            🔧 Dev OTP Helper
            <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">
              DEV
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="text-white hover:bg-slate-800"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isVisible && (
        <CardContent className="pt-0">
          {otpLogs.length === 0 ? (
            <p className="text-slate-400 text-sm">No OTPs generated yet</p>
          ) : (
            <div className="space-y-2">
              {otpLogs.map((log, index) => (
                <div key={index} className="bg-slate-800 rounded p-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300">{log.email}</span>
                    <span className="text-slate-500">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="bg-slate-700 px-2 py-1 rounded text-green-400 font-mono text-sm">{log.otp}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyOTP(log.otp)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700 h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-500">💡 OTPs are also logged in browser console</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
