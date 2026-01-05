"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useOnchain } from "@/components/providers/onchain-provider"
import { useAccount, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  RefreshCw
} from "lucide-react"

interface SmartWalletConnectProps {
  onConnect?: (address: string) => void
  onReady?: () => void
  showNetworkInfo?: boolean
}

export function SmartWalletConnect({ 
  onConnect, 
  onReady, 
  showNetworkInfo = true 
}: SmartWalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const { isReady, networkInfo, error: onchainError, balance } = useOnchain()
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isConnected && address && isReady) {
      onConnect?.(address)
      onReady?.()
    }
  }, [isConnected, address, isReady, onConnect, onReady])

  useEffect(() => {
    if (onchainError) {
      setError(onchainError)
    } else {
      setError(null)
    }
  }, [onchainError])

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

      // Switch to Base network if needed
      if (chain?.id !== base.id) {
        try {
          await switchChain({ chainId: base.id })
        } catch (switchError: any) {
          // If user rejects network switch, provide helpful message
          if (switchError.message?.includes("User rejected")) {
            throw new Error("Please switch to Base network to continue")
          }
          throw switchError
        }
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to connect wallet"
      
      if (error.message.includes("User rejected")) {
        errorMessage = "Wallet connection was cancelled. Please try again."
      } else if (error.message.includes("No accounts found")) {
        errorMessage = "No accounts found in your wallet. Please unlock your wallet."
      } else if (error.message.includes("install")) {
        errorMessage = "Please install a Web3 wallet like MetaMask or use Coinbase Wallet."
      } else if (error.message.includes("Base network")) {
        errorMessage = "Please switch to Base network to continue."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToBase = async () => {
    try {
      await switchChain({ chainId: base.id })
    } catch (error: any) {
      setError("Failed to switch to Base network")
    }
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

  if (isConnected && isReady) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Ready to Contribute
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="font-mono text-sm bg-white p-2 rounded border">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            {balance && (
              <div className="text-sm bg-white p-2 rounded border">
                Balance: {parseFloat(balance).toFixed(2)} USDC
              </div>
            )}
            {showNetworkInfo && (
              <div className="text-xs text-green-700">
                <div>Network: {networkInfo.name}</div>
                <div>Currency: {networkInfo.currency}</div>
              </div>
            )}
          </div>
          <div className="text-xs text-green-700">
            Your wallet is connected and ready for USDC payments
          </div>
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
          Connect your Web3 wallet to contribute using USDC on Base network.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isConnected && chain?.id !== base.id ? (
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please switch to Base network to use USDC payments
              </AlertDescription>
            </Alert>
            <Button onClick={switchToBase} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Switch to Base Network
            </Button>
          </div>
        ) : (
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
        )}

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Supports Coinbase Wallet, MetaMask, and other Web3 wallets</p>
          <p>Powered by Onchain Kit</p>
          <a 
            href="https://onchainkit.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Learn more <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
