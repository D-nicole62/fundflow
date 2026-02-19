import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  try {
    // Replaced Supabase Auth with Mock Context
    // In a real app: check headers/cookies for session.
    // For local demo/dev: Assume logged in as "user-123"

    // We can simulate a "check" here. If we wanted to enforce login page visit first,
    // we would check a cookie. For now, we assume if they hit dashboard they are "logged in".
    const user = { id: "user-123", email: "demo@example.com" }

    if (!user) {
      redirect("/auth/login")
    }

    return (
      <div className="min-h-screen bg-muted/30">
        <DashboardHeader />
        <main className="container py-8">
          <div className="space-y-8">
            <Suspense fallback={<DashboardStatsSkeleton />}>
              <DashboardStats userId={user.id} />
            </Suspense>
            <div className="grid gap-8 lg:grid-cols-2">
              <Suspense fallback={<DashboardCardSkeleton />}>
                <RecentCampaigns userId={user.id} />
              </Suspense>
              <Suspense fallback={<DashboardCardSkeleton />}>
                <RecentContributions userId={user.id} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Dashboard page error:", error)
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Loading Dashboard</h3>
              <p className="text-sm text-muted-foreground">Please wait while we load your dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DashboardCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
