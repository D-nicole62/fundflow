"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
// import { createClient } from "@/lib/supabase/client" // REMOVED
// import type { User } from "@supabase/supabase-js" // REMOVED

// Mock User interface to satisfy existing code usage
interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock auth initialization
    // In a real migration, this would check a cookie or local storage token
    // For now, we simulate a check that completes quickly
    // If you want to simulate a logged-in user by default for dev, uncomment below:
    /*
    setUser({
        id: "user-123",
        email: "demo@example.com",
        user_metadata: { full_name: "Demo User" }
    })
    */

    // Check local storage for "mock_auth" to simulate session persistence
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem("mock_auth_user") : null
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse stored user", e)
      }
    }

    setLoading(false)
  }, [])

  const signOut = async () => {
    if (typeof window !== 'undefined') localStorage.removeItem("mock_auth_user")
    setUser(null)
    window.location.href = "/"
  }

  // Also export a way to "login" for the mock form to use if needed, 
  // though the mock form currently just redirects. 
  // We can update the mock login form to set this local storage if we want persistence.

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
