import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CampaignDetailView } from "@/components/campaigns/campaign-detail-view"
import type { Campaign, Contribution, CampaignUpdate } from "@/types/campaign"

interface CampaignPageProps {
  params: {
    id: string
  }
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const supabase = await createClient()
  const campaignId = await params.id

  // Fetch campaign with creator and contributions
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      profiles!campaigns_creator_id_fkey (
        id,
        full_name,
        avatar_url,
        bio,
        created_at,
        updated_at
      ),
      contributions (
        id,
        amount,
        message,
        anonymous,
        created_at,
        contributor_id,
        profiles!contributions_contributor_id_fkey (
          id,
          full_name,
          avatar_url,
          bio,
          created_at,
          updated_at
        )
      ),
      campaign_updates (
        id,
        title,
        content,
        created_at
      )
    `)
    .eq("id", campaignId)
    .eq("status", "active")
    .single()

  if (error || !campaign) {
    console.error("Campaign fetch error:", error)
    notFound()
  }

  // Get current user for contribution permissions
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile if authenticated
  let currentUser = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    
    currentUser = profile
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <CampaignDetailView 
        campaign={campaign as Campaign} 
        contributions={campaign.contributions || []}
        updates={campaign.campaign_updates || []}
        currentUser={currentUser} 
      />
    </div>
  )
}

// Generate metadata for the page
export async function generateMetadata({ params }: CampaignPageProps) {
  const supabase = await createClient()
  const campaignId = await params.id
  
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("title, description, image_url")
    .eq("id", campaignId)
    .single()

  if (!campaign) {
    return {
      title: "Campaign Not Found",
    }
  }

  return {
    title: `${campaign.title} - FundFlow`,
    description: campaign.description?.slice(0, 160) + "...",
    openGraph: {
      title: campaign.title,
      description: campaign.description,
      images: campaign.image_url ? [campaign.image_url] : [],
    },
  }
} 