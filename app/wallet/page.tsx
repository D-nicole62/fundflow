"use client"

import { WalletManagement } from "@/components/wallet/wallet-management"

export default function WalletPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wallet Settings</h1>
          <p className="text-gray-600">
            Manage your wallet addresses for receiving campaign contributions and x402 payments.
          </p>
        </div>
        
        <WalletManagement />
      </div>
    </div>
  )
}
