"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserWallet(walletAddress: string) {
  try {
    console.log("updateUserWallet called with:", walletAddress)

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Auth error:", authError)
      throw new Error("Authentication failed")
    }

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
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        wallet_address: cleanAddress,
        wallet_type: "coinbase_smart_wallet",
        wallet_verified: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    )

    if (profileError) {
      console.error("Profile update error:", profileError)
      throw new Error(`Failed to update wallet address: ${profileError.message}`)
    }

    console.log("Wallet updated successfully")

    // Revalidate paths
    try {
      revalidatePath("/dashboard")
      revalidatePath("/profile")
      revalidatePath("/wallet")
    } catch (revalidateError) {
      console.warn("Revalidation warning:", revalidateError)
      // Don't fail the operation if revalidation fails
    }

    return { success: true, walletAddress: cleanAddress }
  } catch (error) {
    console.error("updateUserWallet error:", error)
    throw error
  }
}

export async function getUserWallet(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("wallet_address, wallet_type, wallet_verified")
      .eq("id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("getUserWallet error:", error)
      throw new Error("Failed to fetch wallet information")
    }

    return data || null
  } catch (error) {
    console.error("getUserWallet error:", error)
    throw error
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
