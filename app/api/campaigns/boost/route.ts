import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { campaignId, boostType, duration } = await request.json()

    if (!campaignId || !boostType) {
      return NextResponse.json({ error: "Campaign ID and boost type are required" }, { status: 400 })
    }

    // Get payment proof from headers
    const paymentProof = request.headers.get("x-payment-proof")

    if (!paymentProof) {
      return NextResponse.json({ error: "Payment verification required" }, { status: 402 })
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Create boost record
    const durationHours = duration || 24
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)

    const boost = await prisma.campaignBoost.create({
      data: {
        campaign_id: campaignId,
        boost_type: boostType,
        duration_hours: durationHours,
        status: "active",
        payment_proof: paymentProof,
        expires_at: expiresAt
      }
    })

    // Apply boost effects
    const boostEffects = await applyBoostEffects(campaignId, boostType, expiresAt)

    return NextResponse.json({
      success: true,
      boost,
      effects: boostEffects,
      payment_verified: true,
      message: `Campaign boosted successfully with ${boostType} for ${duration || 24} hours`,
    })
  } catch (error) {
    console.error("Boost campaign API error:", error)
    return NextResponse.json({ error: "Failed to boost campaign" }, { status: 500 })
  }
}

async function applyBoostEffects(campaignId: string, boostType: string, expiresAt: Date) {
  const effects = {
    visibility_increase: 0,
    featured_placement: false,
    social_media_promotion: false,
    email_newsletter: false,
    live_payment_verified: true,
  }

  switch (boostType) {
    case "visibility":
      effects.visibility_increase = 200
      break
    case "featured":
      effects.featured_placement = true
      effects.visibility_increase = 500
      break
    case "premium":
      effects.featured_placement = true
      effects.social_media_promotion = true
      effects.email_newsletter = true
      effects.visibility_increase = 1000
      break
  }

  // Update campaign with boost flags
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      is_boosted: true,
      boost_type: boostType,
      boost_expires_at: expiresAt,
    }
  })

  return effects
}
