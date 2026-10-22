import type React from "react"
import type { Metadata } from "next"
import { Heebo } from "next/font/google"
import "./globals.css"

const heebo = Heebo({ subsets: ["hebrew", "latin"] })

export const metadata: Metadata = {
  title: "הגלעד 3 נתניה",
  description: "לוח מידע ללובי הבניין",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${heebo.className} bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900`}
        style={{
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  )
}
