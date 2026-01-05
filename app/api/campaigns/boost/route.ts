import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Payment verification is handled by middleware
    const supabase = await createClient()
    const { campaignId, boostType, duration } = await request.json()

    if (!campaignId || !boostType) {
      return NextResponse.json({ error: "Campaign ID and boost type are required" }, { status: 400 })
    }

    // Get payment proof from headers (set by middleware after verification)
    const paymentProof = request.headers.get("x-payment-proof")

    if (!paymentProof) {
      return NextResponse.json({ error: "Payment verification required" }, { status: 402 })
    }

    // Verify campaign exists
    const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", campaignId).single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Create boost record with payment proof
    const boostData = {
      campaign_id: campaignId,
      boost_type: boostType,
      duration_hours: duration || 24,
      status: "active",
      payment_proof: paymentProof,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (duration || 24) * 60 * 60 * 1000).toISOString(),
    }

    const { data: boost, error } = await supabase.from("campaign_boosts").insert(boostData).select().single()

    if (error) {
      throw error
    }

    // Apply boost effects
    const boostEffects = await applyBoostEffects(supabase, campaignId, boostType)

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

async function applyBoostEffects(supabase: any, campaignId: string, boostType: string) {
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
  await supabase
    .from("campaigns")
    .update({
      is_boosted: true,
      boost_type: boostType,
      boost_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", campaignId)

  return effects
}
