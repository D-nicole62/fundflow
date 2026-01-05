import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Target, Users, TrendingUp, AlertTriangle } from "lucide-react"

interface DashboardStatsProps {
  userId: string
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  try {
    const supabase = await createClient()

    // Check if tables exist by trying to query them
    let campaigns = null
    let contributions = null
    let campaignsError = null
    let contributionsError = null

    try {
      const { data: campaignsData, error: campaignsErr } = await supabase
        .from("campaigns")
        .select("current_amount, goal_amount")
        .eq("creator_id", userId)

      campaigns = campaignsData
      campaignsError = campaignsErr
    } catch (error) {
      console.error("Campaigns table error:", error)
      campaignsError = error
    }

    try {
      const { data: contributionsData, error: contributionsErr } = await supabase
        .from("contributions")
        .select("amount")
        .eq("contributor_id", userId)

      contributions = contributionsData
      contributionsError = contributionsErr
    } catch (error) {
      console.error("Contributions table error:", error)
      contributionsError = error
    }

    // If tables don't exist, show setup message
    if (
      (campaignsError && typeof campaignsError === 'object' && 'message' in campaignsError && typeof campaignsError.message === 'string' && campaignsError.message.includes("does not exist")) ||
      (contributionsError && typeof contributionsError === 'object' && 'message' in contributionsError && typeof contributionsError.message === 'string' && contributionsError.message.includes("does not exist"))
    ) {
      return (
        <div className="grid gap-4 md:grid-cols-1">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Database Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-orange-700">
                  The database tables need to be created. Please run the database setup script.
                </p>
                <div className="bg-orange-100 p-3 rounded-md">
                  <p className="text-xs font-mono text-orange-800">
                    Run the script: scripts/complete-database-setup.sql
                  </p>
                </div>
                <p className="text-xs text-orange-600">
                  This will create all necessary tables including campaigns, contributions, and profiles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    const totalRaised = campaigns?.reduce((sum: number, campaign: any) => sum + Number(campaign.current_amount || 0), 0) || 0
    const totalGoal = campaigns?.reduce((sum: number, campaign: any) => sum + Number(campaign.goal_amount || 0), 0) || 0
    const totalContributed =
      contributions?.reduce((sum: number, contribution: any) => sum + Number(contribution.amount || 0), 0) || 0
    const activeCampaigns = campaigns?.length || 0

    const stats = [
      {
        title: "Total Raised",
        value: `$${totalRaised.toLocaleString()}`,
        description: "Across all campaigns",
        icon: DollarSign,
      },
      {
        title: "Active Campaigns",
        value: activeCampaigns.toString(),
        description: "Currently fundraising",
        icon: Target,
      },
      {
        title: "Total Contributed",
        value: `$${totalContributed.toLocaleString()}`,
        description: "To other campaigns",
        icon: Users,
      },
      {
        title: "Success Rate",
        value: totalGoal > 0 ? `${Math.round((totalRaised / totalGoal) * 100)}%` : "0%",
        description: "Of funding goals",
        icon: TrendingUp,
      },
    ]

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    console.error("DashboardStats error:", error)

    // Return fallback UI instead of throwing
    return (
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Database Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                Unable to load dashboard statistics. The database may need to be set up.
              </p>
              <div className="bg-red-100 p-3 rounded-md">
                <p className="text-xs font-mono text-red-800">
                  Error: {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
              <p className="text-xs text-red-600">
                Please run the complete database setup script to create all required tables.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
