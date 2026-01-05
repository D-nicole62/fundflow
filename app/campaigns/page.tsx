import { createClient } from "@/lib/supabase/server"
import { CampaignGrid } from "@/components/campaigns/campaign-grid"
import { CampaignFilters } from "@/components/campaigns/campaign-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CampaignsPage() {
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      id,
      title,
      description,
      goal_amount,
      current_amount,
      image_url,
      category,
      created_at,
      profiles!campaigns_creator_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })

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
            <CampaignGrid campaigns={campaigns || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
