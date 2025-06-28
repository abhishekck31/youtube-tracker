"use client"
import Image from "next/image"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-50 to-blue-200 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full opacity-30 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-200 rounded-full opacity-30 animate-pulse" />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 border border-blue-100 shadow-2xl rounded-2xl px-10 py-12 flex flex-col items-center">
          <Image
            src="/unacademy-logo.png"
            alt="Unacademy Logo"
            width={100}
            height={100}
            className="mb-6 drop-shadow-lg"
            priority
          />
          <h1 className="text-3xl font-extrabold mb-2 text-center text-blue-800 tracking-tight">Unacademy Hours Tracker</h1>
          <p className="mb-8 text-gray-600 text-center text-base">Sign in with your Unacademy email to continue</p>
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-3 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.7 30.77 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.13 13.13 17.57 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.7 15.27 0 19.51 0 24c0 4.49.7 8.73 2.69 12.24l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.19-5.6c-2.01 1.35-4.59 2.15-8.71 2.15-6.43 0-11.87-3.63-14.33-8.89l-7.98 6.2C6.73 42.2 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            <span className="text-base font-medium">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  )
} 