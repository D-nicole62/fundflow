import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CampaignCreateWrapper } from "@/components/campaigns/campaign-create-wrapper"

export default async function CreateCampaignPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth error on create campaign page:", error)
      redirect("/auth/login?message=Please sign in to create a campaign")
    }

    if (!user) {
      redirect("/auth/login?message=Please sign in to create a campaign")
    }

    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Your Campaign</h1>
              <p className="text-muted-foreground">
                Share your story and start raising funds for your cause. Set up your USDC wallet to receive payments
                directly.
              </p>
            </div>
            <CampaignCreateWrapper />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Create campaign page error:", error)
    redirect("/auth/login?message=Authentication required to create a campaign")
  }
}
