<<<<<<< HEAD
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { openSans } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "YouTube Hours Tracker | Educational Content Dashboard",
  description: "Professional dashboard for tracking YouTube educational content hours and analytics",
  generator: 'v0.dev'
=======
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
>>>>>>> a0bb10b (Initial Commit)
}

export default function RootLayout({
  children,
<<<<<<< HEAD
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={openSans.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
=======
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
>>>>>>> a0bb10b (Initial Commit)
    </html>
  )
}
