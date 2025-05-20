import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Residential Building Lobby Dashboard",
  description: "A modern dashboard for residential building lobbies",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.className} bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900`} style={{
        minHeight: "100vh",
        margin: 0,
        backgroundAttachment: "fixed"
      }}>{children}</body>
    </html>
  )
}
