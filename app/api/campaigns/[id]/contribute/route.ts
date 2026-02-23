import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

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
    const sessionData = await prisma.paymentSession.findUnique({
      where: { tx_hash: txHash }
    })

    if (!sessionData || Number(sessionData.amount) !== Number(amount)) {
      return NextResponse.json({ error: "Payment session not verified" }, { status: 401 })
    }

    // Get campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
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
        current_amount: Number(campaign.current_amount),
        goal_amount: Number(campaign.goal_amount),
      },
      payment: {
        amount: Number(amount),
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
    const campaignId = params.id

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
    const sessionData = await prisma.paymentSession.findUnique({
      where: { tx_hash: txHash }
    })

    if (!sessionData) {
      return NextResponse.json({ error: "Payment session not verified" }, { status: 401 })
    }

    // Get request body for contribution details
    const { message, anonymous } = await request.json()

    // Real Supabase Auth Check
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    // Get campaign details for updating current amount
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Ensure Contributor exists (Supabase user)
    // Since we added a relation, the user needs to exist in Prisma.
    await prisma.profile.upsert({
      where: { id: userId },
      create: { id: userId, full_name: "User" },
      update: {}
    })

    // Create the contribution record
    const contribution = await prisma.contribution.create({
      data: {
        campaign_id: campaignId,
        contributor_id: userId,
        amount: Number(amount),
        message: message || null,
        anonymous: anonymous || false,
        // transaction_hash: txHash, // Field doesn't exist in Contribution model yet, strictly speaking.
        // If we want to store txHash on contribution we need to add it to schema.
        // Schema currently has: amount, message, anonymous, campaign_id, contributor_id.
        // I will skip txHash for contribution table for now as it's not in schema I defined earlier.
        // Use PaymentSession for tx tracking.
      }
    })

    // Update campaign current amount
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        current_amount: { increment: Number(amount) },
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      contribution: {
        id: contribution.id,
        amount: Number(contribution.amount),
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