import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ClientProviders } from "@/components/providers/client-providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Thula Funds - Modern Crowdfunding Platform",
  description: "Secure, transparent crowdfunding with Web3 integration",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Remove the API key from client-side
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
