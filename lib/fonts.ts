import { Open_Sans } from "next/font/google"

/*
 * Put your licensed Averta font files in /public/fonts/averta/
 * Example file names used below – adjust if yours differ.
 */
export const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})
