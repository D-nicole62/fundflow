import { redirect } from "next/navigation"
import { CampaignCreateWrapper } from "@/components/campaigns/campaign-create-wrapper"

export default async function CreateCampaignPage() {
  // Removed server-side Supabase auth check. 
  // Allowing access to the page; the actual submission via Server Action checks for the user (mock user).
  // Alternatively, could check for a cookie here if we implemented one.

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
}
