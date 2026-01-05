"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"

export function CampaignFilters() {
  const categories = [
    "All",
    "Education",
    "Healthcare",
    "Technology",
    "Community",
    "Environment",
    "Arts & Culture",
    "Sports",
    "Business",
    "Emergency",
  ]

  const sortOptions = ["Most Recent", "Most Funded", "Nearly Complete", "Trending"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Sort By</h4>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <Button
                  key={option}
                  variant={option === "Most Recent" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
                <span className="text-sm text-muted-foreground">150</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Trending
                </Badge>
                <span className="text-sm text-muted-foreground">23</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  Nearly Complete
                </Badge>
                <span className="text-sm text-muted-foreground">12</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
