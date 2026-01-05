"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Heart } from "lucide-react"
import type { CampaignProgressProps } from "@/types/campaign"

export function CampaignProgress({ campaign, onContributeAction }: CampaignProgressProps) {
  const progress = Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)
  const isCompleted = progress >= 100
  
  // Calculate days left (assuming 30-day campaign duration)
  const campaignStartDate = new Date(campaign.created_at)
  const campaignEndDate = new Date(campaignStartDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const daysLeft = Math.max(0, Math.ceil((campaignEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const contributionsCount = campaign.contributions?.length || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          Campaign Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Raised</span>
            <span className="font-semibold">{formatCurrency(campaign.current_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Goal</span>
            <span>{formatCurrency(campaign.goal_amount)}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-center text-sm text-muted-foreground">
            {progress.toFixed(1)}% of goal reached
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {contributionsCount}
            </div>
            <div className="text-xs text-muted-foreground">Contributors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {daysLeft}
            </div>
            <div className="text-xs text-muted-foreground">Days Left</div>
          </div>
        </div>

        {!isCompleted ? (
          <Button 
            onClick={onContributeAction}
            className="w-full"
            size="lg"
          >
            <Heart className="w-4 h-4 mr-2" />
            Contribute Now
          </Button>
        ) : (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-semibold text-green-800">Goal Reached!</div>
            <div className="text-sm text-green-700">This campaign has achieved its funding goal</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 