import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import Script from "next/script"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "WhatsApp Bot Yöneticisi - Akıllı Mesajlaşma Platformu",
  description: "Akıllı mesajlaşma ve akıllı iş akışları ile eksiksiz WhatsApp AI otomasyon platformu",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" data-bs-theme="light">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: "var(--font-geist-sans)" }}>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
