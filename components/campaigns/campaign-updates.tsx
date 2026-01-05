"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import type { CampaignUpdatesProps } from "@/types/campaign"

export function CampaignUpdates({ updates }: CampaignUpdatesProps) {
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedUpdates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No updates yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedUpdates.map((update) => (
              <div key={update.id} className="border-l-4 border-primary pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{update.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(update.created_at))} ago
                  </span>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {update.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 