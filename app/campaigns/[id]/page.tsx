import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CampaignPage({ params }: CampaignPageProps) {
  const campaignId = params.id

  // Fetch campaign with creator and contributions
  const campaignData = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
      status: "active"
    },
    include: {
      creator: true,
      campaign_updates: true,
      contributions: {
        include: {
          contributor: true
        },
        orderBy: { created_at: 'desc' }
      }
    }
  })

  if (!campaignData) {
    console.error("Campaign not found or error")
    notFound()
  }

  // Map to exclude Decimal and match expected UI types (mostly aliasing relations to "profiles")
  const campaign = {
    ...campaignData,
    current_amount: Number(campaignData.current_amount),
    goal_amount: Number(campaignData.goal_amount),
    profiles: campaignData.creator, // Alias for UI compatibility
    contributions: campaignData.contributions.map(c => ({
      ...c,
      amount: Number(c.amount),
      profiles: c.contributor // Alias for UI compatibility
    })),
    campaign_updates: campaignData.campaign_updates.map(u => ({
      ...u,
      created_at: u.created_at.toISOString()
    }))
  }

  // Get current user for contribution permissions (Mock)
  // In real app, check cookies/headers. For now, assume null or fetch a demo user if we want access.
  // The UI connects to wallet so maybe user profile isn't strictly needed for view unless owning it.
  // Let's assume no user logged in server-side for this view to keep it simple, 
  // or checks local storage client-side. The prop is `currentUser`.
  const currentUser = null

  return (
    <div className="min-h-screen bg-muted/30">
      <CampaignDetailView
        campaign={campaign as any}
        contributions={campaign.contributions}
        updates={campaign.campaign_updates || []}
        currentUser={currentUser}
      />
    </div>
  )
}

// Generate metadata for the page
export async function generateMetadata({ params }: CampaignPageProps) {
  const campaignId = params.id

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { title: true, description: true, image_url: true }
  })

  if (!campaign) {
    return {
      title: "Campaign Not Found",
    }
  }

  return {
    title: `${campaign.title} - Thula Funds`,
    description: campaign.description?.slice(0, 160) + "...",
    openGraph: {
      title: campaign.title,
      description: campaign.description,
      images: campaign.image_url ? [campaign.image_url] : [],
    },
  }
} 