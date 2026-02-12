import { prisma } from "@/lib/prisma"
import { CampaignGrid } from "@/components/campaigns/campaign-grid"
import { CampaignFilters } from "@/components/campaigns/campaign-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CampaignsPage() {
  const campaignsData = await prisma.campaign.findMany({
    where: { status: "active" },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      goal_amount: true,
      current_amount: true,
      image_url: true,
      category: true,
      created_at: true,
      creator: {
        select: {
          full_name: true,
          avatar_url: true
        }
      }
    }
  })

  // Map Prisma result to match the structure expected by components (which expect 'profiles' from Supabase)
  const campaigns = campaignsData.map(c => ({
    ...c,
    profiles: c.creator,
    // Ensure numbers are numbers or strings as expected. Prisma Decimal is usually object or special type.
    // However, if the component expects basic JSON numbers, we might need conversion. 
    // Usually standard Next.js passing props works fine or we convert.
    // For now assuming existing components handle what they get, but let's be safe on Decimal.
    goal_amount: Number(c.goal_amount),
    current_amount: Number(c.current_amount)
  }))

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Campaigns</h1>
            <p className="text-muted-foreground">Discover and support amazing causes from our community</p>
          </div>
          <Link href="/campaigns/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Start Campaign
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <CampaignFilters />
          </div>
          <div className="lg:col-span-3">
            <CampaignGrid campaigns={campaigns} />
          </div>
        </div>
      </div>
    </div>
  )
}
