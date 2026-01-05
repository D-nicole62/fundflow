"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface WalletConnectProps {
  onConnect?: (address: string) => void
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if wallet is available
      if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
        throw new Error("Please install a Web3 wallet like MetaMask or use Coinbase Wallet")
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const address = accounts[0]
      setConnectedAddress(address)
      onConnect?.(address)
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setConnectedAddress(null)
    setError(null)
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connectedAddress) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="font-mono text-sm bg-white p-2 rounded border">
            {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
          </div>
          <Button onClick={disconnectWallet} variant="outline" size="sm" className="w-full bg-transparent">
            Disconnect
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Web3 wallet to enable crypto payments and onchain features.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <Button onClick={connectWallet} disabled={isConnecting} className="w-full">
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Supports MetaMask, Coinbase Wallet, and other Web3 wallets
        </div>
      </CardContent>
    </Card>
  )
}
