"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { coinbaseWallet, walletConnect, injected } from "wagmi/connectors"
import { useState, useEffect } from "react"

interface WagmiOnlyProviderProps {
  children: React.ReactNode
}

// Configure Wagmi for Base network with multiple wallet options
const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    // Primary: Coinbase Smart Wallet 
    coinbaseWallet({
      appName: "Thula Funds",
      appLogoUrl: "/public/images/logo2.png",
      preference: "smartWalletOnly",
    }),
    // Fallback: Injected wallets (MetaMask, etc.)
    injected(),
    // Optional: WalletConnect (only if project ID is available)
    ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID &&
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID !== "your_walletconnect_project_id_here"
      ? [
        walletConnect({
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        })
      ]
      : []
    ),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

export function WagmiOnlyProvider({ children }: WagmiOnlyProviderProps) {
  const [mounted, setMounted] = useState(false)

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render providers until mounted to prevent hydration issues
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
