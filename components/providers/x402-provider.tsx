"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseUnits } from "viem"
import { base } from "wagmi/chains"

interface X402ContextType {
  paymentStatus: "idle" | "pending" | "completed" | "failed"
  makePayment: (endpoint: string, amount: string, recipientAddress?: string) => Promise<any>
  paymentHistory: PaymentRecord[]
  networkInfo: {
    name: string
    currency: string
    contractAddress: string
  }
  isReady: boolean
  error: string | null
}

interface PaymentRecord {
  id: string
  endpoint: string
  amount: string
  timestamp: Date
  status: "completed" | "failed"
  network: string
  txHash: string
  recipientAddress?: string
}

const X402Context = createContext<X402ContextType>({
  paymentStatus: "idle",
  makePayment: async () => {
    throw new Error("Payment system not available")
  },
  paymentHistory: [],
  networkInfo: {
    name: "Base Mainnet",
    currency: "USDC",
    contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  isReady: false,
  error: null,
})

export const useX402 = () => useContext(X402Context)

// USDC Contract ABI (only the functions we need)
const USDC_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const

function X402ProviderInner({ children }: { children: ReactNode }) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "completed" | "failed">("idle")
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTxHash, setCurrentTxHash] = useState<string>("")

  // Wagmi hooks with error handling
  let address: string | undefined
  let isConnected: boolean = false
  let chain: any = null
  let writeContract: any = null
  let isPending: boolean = false
  let txHash: `0x${string}` | undefined
  let wagmiError: any = null
  let isConfirming: boolean = false
  let isConfirmed: boolean = false

  try {
    const accountData = useAccount()
    address = accountData.address
    isConnected = accountData.isConnected
    chain = accountData.chain

    const writeContractData = useWriteContract()
    writeContract = writeContractData.writeContract
    isPending = writeContractData.isPending
    txHash = writeContractData.data
    wagmiError = writeContractData.error

    const receiptData = useWaitForTransactionReceipt({
      hash: txHash as `0x${string}` | undefined,
    })
    isConfirming = receiptData.isLoading
    isConfirmed = receiptData.isSuccess
  } catch (err) {
    console.warn("Wagmi hooks not available:", err)
    setError("Wallet connection not available")
  }

  const networkInfo = {
    name: "Base Mainnet",
    currency: "USDC",
    contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  }

  useEffect(() => {
    setIsReady(isConnected && chain?.id === base.id)
    if (isConnected && chain?.id !== base.id) {
      setError("Please switch to Base network")
    } else if (isConnected && chain?.id === base.id) {
      setError(null)
    }
  }, [isConnected, chain])

  // Handle transaction status changes
  useEffect(() => {
    if (isPending) {
      setPaymentStatus("pending")
      setError(null)
    } else if (isConfirmed && txHash) {
      setPaymentStatus("completed")
      setCurrentTxHash(txHash)
      setError(null)
    } else if (wagmiError) {
      setPaymentStatus("failed")
      setError(wagmiError.message || "Transaction failed")
      console.error("Payment failed:", wagmiError)
    }
  }, [isPending, isConfirmed, txHash, wagmiError])

  const makePayment = async (endpoint: string, amountStr: string, recipientAddress?: string): Promise<any> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    if (!writeContract) {
      throw new Error("Wallet not properly initialized")
    }

    if (chain?.id !== base.id) {
      throw new Error("Please switch to Base network to make payments")
    }

    setPaymentStatus("pending")
    setError(null)

    try {
      // Parse the amount (remove $ sign and convert to USDC units)
      const cleanAmount = amountStr.replace("$", "")
      const amountInUSDC = parseUnits(cleanAmount, 6) // USDC has 6 decimals

      // Determine recipient address
      const recipient = recipientAddress || process.env.NEXT_PUBLIC_X402_WALLET_ADDRESS || networkInfo.contractAddress

      if (!recipient) {
        throw new Error("No recipient address specified")
      }

      // Execute USDC transfer
      const result = await writeContract({
        address: networkInfo.contractAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [recipient as `0x${string}`, amountInUSDC],
      })

      // Wait for transaction hash to be available
      let currentTxHash = result
      let attempts = 0
      const maxAttempts = 30 // Wait up to 30 seconds

      while (!currentTxHash && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        attempts++
        // Check if txHash is now available from the hook
        if (txHash) {
          currentTxHash = txHash
          break
        }
      }

      if (!currentTxHash) {
        throw new Error("Transaction submitted but hash not available")
      }

      // Wait for transaction confirmation
      let isConfirmed = false
      attempts = 0

      while (!isConfirmed && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        attempts++
        
        // Check if transaction is confirmed
        if (isConfirmed) {
          break
        }
      }

      if (!isConfirmed) {
        throw new Error("Transaction submitted but not yet confirmed")
      }

      // Create payment record after confirmation
      const paymentRecord: PaymentRecord = {
        id: crypto.randomUUID(),
        endpoint,
        amount: amountStr,
        timestamp: new Date(),
        status: "completed",
        network: "Base Mainnet",
        txHash: currentTxHash,
        recipientAddress: recipient,
      }

      setPaymentHistory((prev) => [paymentRecord, ...prev])

      // Store payment session for API access
      try {
        await fetch("/api/x402/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash: currentTxHash,
            amount: parseFloat(cleanAmount),
            endpoint,
            fromAddress: address,
            recipientAddress: recipient,
          }),
        })
      } catch (verifyError) {
        console.warn("Failed to verify payment session:", verifyError)
        // Continue even if verification fails
      }

      // Make authenticated API call with payment proof
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-payment-session": JSON.stringify({
            amount: parseFloat(cleanAmount),
            endpoint,
            txHash: currentTxHash,
            timestamp: Date.now(),
            recipient: recipient,
          }),
        },
      })

      if (response.ok) {
        const data = await response.json()
        return { ...data, txHash: currentTxHash }
      } else {
        throw new Error(`API request failed: ${response.statusText}`)
      }
    } catch (error: any) {
      setPaymentStatus("failed")
      setError(error.message || "Payment failed")
      throw error
    }
  }

  return (
    <X402Context.Provider value={{ 
      paymentStatus, 
      makePayment, 
      paymentHistory, 
      networkInfo, 
      isReady, 
      error 
    }}>
      {children}
    </X402Context.Provider>
  )
}

export function X402Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <X402Context.Provider value={{
        paymentStatus: "idle",
        makePayment: async () => {
          throw new Error("Payment system not ready")
        },
        paymentHistory: [],
        networkInfo: {
          name: "Base Mainnet",
          currency: "USDC",
          contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        },
        isReady: false,
        error: "Loading...",
      }}>
        <div suppressHydrationWarning>{children}</div>
      </X402Context.Provider>
    )
  }

  return <X402ProviderInner>{children}</X402ProviderInner>
}
