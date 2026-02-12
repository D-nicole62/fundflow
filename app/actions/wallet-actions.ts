"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateUserWallet(walletAddress: string) {
  try {
    console.log("updateUserWallet called with:", walletAddress)

    // Mock Auth Check
    const user = { id: "user-123" }

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Validate wallet address format
    if (!walletAddress || typeof walletAddress !== "string") {
      throw new Error("Invalid wallet address")
    }

    const cleanAddress = walletAddress.trim().toLowerCase()

    if (!cleanAddress.startsWith("0x") || cleanAddress.length !== 42) {
      throw new Error("Invalid wallet address format")
    }

    console.log("Updating profile for user:", user.id, "with wallet:", cleanAddress)

    // Update user profile with wallet address
    // Using upsert to ensure profile exists
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        wallet_address: cleanAddress,
        wallet_type: "coinbase_smart_wallet",
        wallet_verified: true,
        updated_at: new Date(),
      },
      create: {
        id: user.id,
        wallet_address: cleanAddress,
        wallet_type: "coinbase_smart_wallet",
        wallet_verified: true,
        updated_at: new Date(),
        // Add defaults for required fields if any (schema allows nulls mostly)
        full_name: "Demo User"
      }
    })

    console.log("Wallet updated successfully")

    // Revalidate paths
    try {
      revalidatePath("/dashboard")
      revalidatePath("/profile")
      revalidatePath("/wallet")
    } catch (revalidateError) {
      console.warn("Revalidation warning:", revalidateError)
    }

    return { success: true, walletAddress: cleanAddress }
  } catch (error) {
    console.error("updateUserWallet error:", error)
    throw error // Re-throw to be handled by caller
  }
}

export async function getUserWallet(userId: string) {
  try {
    // For safety, might want to check auth matches userId, but for read we can just read.
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        wallet_address: true,
        wallet_type: true,
        wallet_verified: true
      }
    })

    return profile || null
  } catch (error) {
    console.error("getUserWallet error:", error)
    throw new Error("Failed to fetch wallet information")
  }
}

export async function validateWalletForPayments(walletAddress: string) {
  try {
    // Basic validation
    if (!walletAddress || typeof walletAddress !== "string") {
      return {
        isValid: false,
        canReceiveUSDC: false,
        error: "Invalid wallet address",
      }
    }

    const cleanAddress = walletAddress.trim().toLowerCase()

    if (!cleanAddress.startsWith("0x") || cleanAddress.length !== 42) {
      return {
        isValid: false,
        canReceiveUSDC: false,
        error: "Invalid wallet address format",
      }
    }

    return {
      isValid: true,
      canReceiveUSDC: true,
      network: "base",
      address: cleanAddress,
    }
  } catch (error) {
    console.error("validateWalletForPayments error:", error)
    return {
      isValid: false,
      canReceiveUSDC: false,
      error: "Wallet validation failed",
    }
  }
}
