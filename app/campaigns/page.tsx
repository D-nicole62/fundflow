import { prisma } from "@/lib/prisma"
import { CampaignGrid } from "@/components/campaigns/campaign-grid"
import { CampaignFilters } from "@/components/campaigns/campaign-filters"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function CampaignsPage() {
  try {
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

    // Map Prisma result to match the structure expected by components
    const campaigns = campaignsData.map(c => ({
      ...c,
      profiles: c.creator,
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
  } catch (error) {
    console.error("Campaigns page error:", error)
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We encountered an error connecting to our services. This is usually due to missing environment variables or database configuration.
            </p>
            <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-32">
              {String(error)}
            </div>
            <Button asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
