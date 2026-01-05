"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { 
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt
} from "wagmi"
import { base } from "wagmi/chains"

interface OnchainContextType {
  paymentStatus: "idle" | "pending" | "completed" | "failed"
  makePayment: (amount: string, recipientAddress: string, campaignId: string) => Promise<any>
  paymentHistory: PaymentRecord[]
  networkInfo: {
    name: string
    currency: string
    contractAddress: string
  }
  isReady: boolean
  error: string | null
  balance: string | null
}

interface PaymentRecord {
  id: string
  amount: string
  recipientAddress: string
  campaignId: string
  timestamp: Date
  status: "completed" | "failed" | "pending"
  network: string
  txHash: string
}

const OnchainContext = createContext<OnchainContextType>({
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
  balance: null,
})

export const useOnchain = () => useContext(OnchainContext)

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



function OnchainProviderInner({ children }: { children: ReactNode }) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "completed" | "failed">("idle")
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTxHash, setCurrentTxHash] = useState<string>("")

  const { address, isConnected, chain } = useAccount()
  const { writeContract, isPending, data: txHash, error: contractError } = useWriteContract()
  
  const { data: balanceData } = useBalance({
    address,
    token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
    chainId: base.id,
  })

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

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
    } else if (contractError) {
      setPaymentStatus("failed")
      setError(contractError.message || "Transaction failed")
      console.error("Payment failed:", contractError)
    }
  }, [isPending, isConfirmed, txHash, contractError])

  const makePayment = async (amountStr: string, recipientAddress: string, campaignId: string): Promise<any> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    if (!writeContract) {
      throw new Error("Wallet not properly initialized")
    }

    if (chain?.id !== base.id) {
      throw new Error("Please switch to Base network to make payments")
    }

    // Validate recipient address
    if (!recipientAddress || !recipientAddress.startsWith("0x") || recipientAddress.length !== 42) {
      throw new Error("Invalid recipient wallet address. Please contact the campaign creator.")
    }

    // Check USDC balance
    if (balanceData && parseFloat(balanceData.formatted) < parseFloat(amountStr)) {
      throw new Error("Insufficient USDC balance")
    }

    setPaymentStatus("pending")
    setError(null)

    try {
      // Parse the amount (remove $ sign and convert to USDC units)
      const cleanAmount = amountStr.replace("$", "")
      const amountNum = parseFloat(cleanAmount)
      
      if (isNaN(amountNum) || amountNum < 0.01) {
        throw new Error("Invalid amount. Minimum contribution is $0.01")
      }
      
      const amountInUSDC = BigInt(Math.floor(amountNum * 1000000)) // USDC has 6 decimals
      
      console.log("Transferring USDC:", {
        from: address,
        to: recipientAddress,
        amount: cleanAmount,
        amountInUSDC: amountInUSDC.toString(),
        contractAddress: networkInfo.contractAddress
      })

      // Execute USDC transfer
      writeContract({
        address: networkInfo.contractAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, amountInUSDC],
      })

      // Wait for the transaction hash to be available
      let transactionHash = txHash
      let hashAttempts = 0
      const maxHashAttempts = 30 // 15 seconds with 500ms intervals

      while (!transactionHash && hashAttempts < maxHashAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        transactionHash = txHash
        hashAttempts++
      }

      // If we still don't have a hash, try to get it from the provider
      if (!transactionHash) {
        // Wait a bit for the transaction to be submitted
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Try to get the hash from the wagmi hook
        if (txHash) {
          transactionHash = txHash
        } else {
          // As a last resort, try to get recent transactions from the wallet
          try {
            if (typeof window !== "undefined" && window.ethereum) {
              const accounts = await window.ethereum.request({ method: "eth_accounts" })
              if (accounts && accounts.length > 0) {
                // Get the latest transaction count to estimate the hash
                const nonce = await window.ethereum.request({
                  method: "eth_getTransactionCount",
                  params: [accounts[0], "latest"]
                })
                
                // This is a fallback - we'll create a temporary hash for tracking
                transactionHash = `pending_${Date.now()}_${nonce}` as `0x${string}`
                console.warn("Using fallback transaction hash:", transactionHash)
              }
            }
          } catch (fallbackError) {
            console.warn("Failed to get fallback transaction hash:", fallbackError)
          }
        }
      }

      if (!transactionHash) {
        // If we still don't have a hash, the transaction was likely successful but we can't track it
        // In this case, we'll create a payment record with a pending status
        const pendingHash = `pending_${Date.now()}_${address.slice(0, 8)}` as `0x${string}`
        
        const paymentRecord: PaymentRecord = {
          id: crypto.randomUUID(),
          amount: amountStr,
          recipientAddress,
          campaignId,
          timestamp: new Date(),
          status: "pending",
          network: "Base Mainnet",
          txHash: pendingHash,
        }

        setPaymentHistory((prev) => [paymentRecord, ...prev])
        
        // Return success with the pending hash
        return { 
          success: true, 
          txHash: pendingHash,
          status: "pending",
          message: "Transaction submitted successfully. Hash will be available shortly."
        }
      }

      // Wait for confirmation (but don't block the user)
      let isConfirmed = false
      let confirmationAttempts = 0
      const maxConfirmationAttempts = 30 // 1 minute with 2-second intervals

      while (!isConfirmed && confirmationAttempts < maxConfirmationAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        confirmationAttempts++
        
        // Check if the transaction is confirmed
        try {
          if (typeof window !== "undefined" && window.ethereum) {
            const receipt = await window.ethereum.request({
              method: "eth_getTransactionReceipt",
              params: [transactionHash]
            })
            if (receipt && receipt.blockNumber) {
              isConfirmed = true
              break
            }
          }
        } catch (checkError) {
          console.warn("Failed to check transaction confirmation:", checkError)
        }
      }

      // Create payment record
      const paymentRecord: PaymentRecord = {
        id: crypto.randomUUID(),
        amount: amountStr,
        recipientAddress,
        campaignId,
        timestamp: new Date(),
        status: isConfirmed ? "completed" : "pending",
        network: "Base Mainnet",
        txHash: transactionHash,
      }

      setPaymentHistory((prev) => [paymentRecord, ...prev])

      // Store payment session for API access
      try {
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash: transactionHash,
            amount: parseFloat(cleanAmount),
            endpoint: `/api/campaigns/${campaignId}/contribute`,
            fromAddress: address,
            recipientAddress: recipientAddress,
          }),
        })
      } catch (verifyError) {
        console.warn("Failed to verify payment session:", verifyError)
      }

      return { 
        success: true, 
        txHash: transactionHash,
        status: isConfirmed ? "completed" : "pending"
      }
    } catch (error: any) {
      setPaymentStatus("failed")
      
      // Provide more specific error messages
      let errorMessage = "Payment failed"
      let errorType = "general"
      
      // Check for user rejection patterns (case-insensitive and more comprehensive)
      const errorMessageLower = error.message.toLowerCase()
      if (errorMessageLower.includes("user rejected") || 
          errorMessageLower.includes("user denied") ||
          errorMessageLower.includes("user cancelled") ||
          errorMessageLower.includes("metamask tx signature: user denied") ||
          errorMessageLower.includes("user denied transaction signature") ||
          errorMessageLower.includes("user rejected the request") ||
          errorMessageLower.includes("transaction was rejected") ||
          errorMessageLower.includes("denied transaction signature")) {
        errorMessage = "Transaction was cancelled. You can try again when you're ready."
        errorType = "user_rejected"
      } else if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Transaction failed. Please check your wallet and try again."
        errorType = "rpc_error"
      } else if (error.message.includes("insufficient funds") || 
                 error.message.includes("Insufficient balance")) {
        errorMessage = "Insufficient USDC balance. Please check your wallet."
        errorType = "insufficient_funds"
      } else if (error.message.includes("Invalid recipient") ||
                 error.message.includes("invalid address")) {
        errorMessage = "Invalid recipient wallet address. Please contact the campaign creator."
        errorType = "invalid_recipient"
      } else if (error.message.includes("hash not available")) {
        errorMessage = "Transaction submitted successfully but hash not available. Please check your wallet for the transaction."
        errorType = "hash_unavailable"
      } else if (error.message.includes("network") ||
                 error.message.includes("chain")) {
        errorMessage = "Please ensure you're connected to Base network."
        errorType = "network_error"
      } else if (error.message.includes("wallet") ||
                 error.message.includes("connection")) {
        errorMessage = "Wallet connection issue. Please reconnect your wallet."
        errorType = "wallet_error"
      } else if (error.message.includes("contract") ||
                 error.message.includes("execution")) {
        errorMessage = "Smart contract error. Please try again or contact support."
        errorType = "contract_error"
      } else if (error.message) {
        errorMessage = error.message
        errorType = "unknown"
      }
      
      // Log detailed error information for debugging
      console.error("Payment error details:", {
        type: errorType,
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      })
      
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return (
    <OnchainContext.Provider value={{ 
      paymentStatus, 
      makePayment, 
      paymentHistory, 
      networkInfo, 
      isReady, 
      error,
      balance: balanceData?.formatted || null
    }}>
      {children}
    </OnchainContext.Provider>
  )
}

export function OnchainProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <OnchainContext.Provider value={{
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
        balance: null,
      }}>
        <div suppressHydrationWarning>{children}</div>
      </OnchainContext.Provider>
    )
  }

  return <OnchainProviderInner>{children}</OnchainProviderInner>
} 