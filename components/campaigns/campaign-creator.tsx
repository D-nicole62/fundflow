"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CampaignCreatorProps } from "@/types/campaign"

export function CampaignCreator({ creator }: CampaignCreatorProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About the Creator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={creator.avatar_url} alt={creator.full_name} />
            <AvatarFallback>
              {getInitials(creator.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{creator.full_name}</div>
            {creator.bio && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {creator.bio}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 