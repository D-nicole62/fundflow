"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Mock user for migration context
const getMockUser = () => ({
  id: "user-123",
  user_metadata: { full_name: "Demo User" }
})

export async function createContribution(campaignId: string, amount: number, message?: string, anonymous?: boolean) {
  const user = getMockUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    const contribution = await prisma.contribution.create({
      data: {
        campaign_id: campaignId,
        contributor_id: user.id,
        amount: amount,
        message: message || null,
        anonymous: anonymous || false
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/campaigns")
    revalidatePath(`/campaigns/${campaignId}`)

    return contribution

  } catch (error) {
    console.error("createContribution error:", error)
    throw new Error("Failed to create contribution")
  }
}

export async function getContributionHistory(userId: string) {
  try {
    const contributions = await prisma.contribution.findMany({
      where: { contributor_id: userId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            image_url: true
          }
        }
      },
      orderBy: { created_at: "desc" }
    })

    // Map relation to match previous structure (campaign -> campaigns)
    return contributions.map(c => {
      const { campaign, ...rest } = c;
      return {
        ...rest,
        campaigns: campaign
      }
    })
  } catch (error) {
    console.error(error)
    throw new Error("Failed to fetch contribution history")
  }
}
