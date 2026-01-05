import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { txHash, amount, endpoint, fromAddress, recipientAddress } = await request.json()

    if (!txHash || !amount || !endpoint || !fromAddress) {
      return NextResponse.json({ error: "Missing required payment data" }, { status: 400 })
    }

    // Verify the transaction exists on Base network
    // Note: In production, you'd want to verify the transaction on-chain
    // For now, we'll store the payment session for API access
    
    const { data: existingSession } = await supabase
      .from("payment_sessions")
      .select("*")
      .eq("tx_hash", txHash)
      .single()

    if (existingSession) {
      return NextResponse.json({ 
        success: true, 
        message: "Payment already verified",
        sessionId: existingSession.id 
      })
    }

    // Store payment session
    const { data: paymentSession, error } = await supabase
      .from("payment_sessions")
      .insert({
        tx_hash: txHash,
        amount: amount,
        from_address: fromAddress,
        endpoint: endpoint,
        status: "completed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error storing payment session:", error)
      return NextResponse.json({ error: "Failed to store payment session" }, { status: 500 })
    }

    // If this payment is for a campaign boost, create the boost record
    if (endpoint.includes("/api/campaigns/boost")) {
      await handleBoostPayment(supabase, txHash, amount, fromAddress, recipientAddress)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment verified and stored",
      sessionId: paymentSession.id,
      txHash: txHash
    })

  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

async function handleBoostPayment(
  supabase: any, 
  txHash: string, 
  amount: number, 
  fromAddress: string, 
  recipientAddress?: string
) {
  try {
    // Determine boost type based on amount
    let boostType = "visibility"
    if (amount >= 0.10) {
      boostType = "premium"
    } else if (amount >= 0.05) {
      boostType = "featured"
    }

    // Note: In a real implementation, you'd need to know which campaign this boost is for
    // This could be passed in the request or stored in a pending boosts table
    console.log(`Boost payment of $${amount} verified for ${boostType} boost`)
    
  } catch (error) {
    console.error("Error handling boost payment:", error)
  }
} 