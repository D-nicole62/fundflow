import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Handle missing or placeholder environment variables during build/prerendering
    const isPlaceholder = !supabaseUrl || !supabaseAnonKey || supabaseAnonKey === "your-anon-key-here"

    if (isPlaceholder) {
        return {
            auth: {
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                getUser: async () => ({ data: { user: null }, error: null }),
                signOut: async () => { },
            },
            storage: {
                from: () => ({
                    upload: async () => ({ data: null, error: new Error("Mock Storage") }),
                    getPublicUrl: () => ({ data: { publicUrl: "" } }),
                }),
            },
        } as any
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
