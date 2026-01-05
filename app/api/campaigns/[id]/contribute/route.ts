import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get payment session from headers
    const paymentSessionHeader = request.headers.get("x-payment-session")
    if (!paymentSessionHeader) {
      return NextResponse.json({ error: "No payment session provided" }, { status: 401 })
    }

    let paymentSession
    try {
      paymentSession = JSON.parse(paymentSessionHeader)
    } catch (error) {
      return NextResponse.json({ error: "Invalid payment session format" }, { status: 400 })
    }

    const { txHash, amount, endpoint, timestamp, recipient } = paymentSession

    if (!txHash || !amount || !endpoint) {
      return NextResponse.json({ error: "Missing payment session data" }, { status: 400 })
    }

    // Verify the payment session exists in our database
    const { data: sessionData, error: sessionError } = await supabase
      .from("payment_sessions")
      .select("*")
      .eq("tx_hash", txHash)
      .eq("amount", amount)
      .eq("endpoint", endpoint)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: "Payment session not verified" }, { status: 401 })
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", params.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Verify the payment amount matches the campaign contribution
    if (campaign.wallet_address && recipient !== campaign.wallet_address) {
      return NextResponse.json({ error: "Payment recipient mismatch" }, { status: 400 })
    }

    // Return campaign contribution data
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        current_amount: campaign.current_amount,
        goal_amount: campaign.goal_amount,
      },
      payment: {
        amount: amount,
        txHash: txHash,
        timestamp: timestamp,
      },
      message: "Contribution verified successfully"
    })

  } catch (error) {
    console.error("Contribution verification error:", error)
    return NextResponse.json({ error: "Failed to verify contribution" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get payment session from headers
    const paymentSessionHeader = request.headers.get("x-payment-session")
    if (!paymentSessionHeader) {
      return NextResponse.json({ error: "No payment session provided" }, { status: 401 })
    }

    let paymentSession
    try {
      paymentSession = JSON.parse(paymentSessionHeader)
    } catch (error) {
      return NextResponse.json({ error: "Invalid payment session format" }, { status: 400 })
    }

    const { txHash, amount, endpoint, timestamp, recipient } = paymentSession

    if (!txHash || !amount || !endpoint) {
      return NextResponse.json({ error: "Missing payment session data" }, { status: 400 })
    }

    // Verify the payment session exists in our database
    const { data: sessionData, error: sessionError } = await supabase
      .from("payment_sessions")
      .select("*")
      .eq("tx_hash", txHash)
      .eq("amount", amount)
      .eq("endpoint", endpoint)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: "Payment session not verified" }, { status: 401 })
    }

    // Get request body for contribution details
    const { message, anonymous } = await request.json()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Get campaign details for updating current amount
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("current_amount")
      .eq("id", params.id)
      .single()

    if (campaignError || !campaign) {
      console.error("Campaign fetch error:", campaignError)
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Create the contribution record
    const { data: contribution, error: contributionError } = await supabase
      .from("contributions")
      .insert({
        campaign_id: params.id,
        contributor_id: user.id,
        amount: amount,
        message: message || null,
        anonymous: anonymous || false,
        transaction_hash: txHash,
      })
      .select()
      .single()

    if (contributionError) {
      console.error("Contribution creation error:", contributionError)
      return NextResponse.json({ error: "Failed to create contribution" }, { status: 500 })
    }

    // Update campaign current amount (this should be handled by database trigger)
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({
        current_amount: campaign.current_amount + amount,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Campaign update error:", updateError)
      // Don't fail the request if campaign update fails
    }

    return NextResponse.json({
      success: true,
      contribution: {
        id: contribution.id,
        amount: contribution.amount,
        message: contribution.message,
        anonymous: contribution.anonymous,
        created_at: contribution.created_at,
      },
      message: "Contribution created successfully"
    })

  } catch (error) {
    console.error("Contribution creation error:", error)
    return NextResponse.json({ error: "Failed to create contribution" }, { status: 500 })
  }
} 