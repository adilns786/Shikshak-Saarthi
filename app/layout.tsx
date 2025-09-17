import type React from "react"
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata = {
  title: "Shikshak Sarthi - Faculty Appraisal System",
  description: "Automated Faculty Appraisal & Development System for Educational Institutions",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  )
}
