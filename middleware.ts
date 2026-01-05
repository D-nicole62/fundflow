import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


// Simple x402 implementation with real payment verification
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes with real pricing
  const protectedRoutes: Record<string, { price: number; description: string }> = {
    "/api/analytics/detailed": {
      price: 0.01, // $0.01 USDC
      description: "Detailed campaign analytics",
    },
    "/api/campaigns/premium": {
      price: 0.005, // $0.005 USDC
      description: "Premium campaign features",
    },
    "/api/campaigns/boost": {
      price: 0.02, // $0.02 USDC
      description: "Boost campaign visibility",
    },
  }

  const route = protectedRoutes[pathname]
  if (!route) {
    return NextResponse.next()
  }

  // Check for payment session or proof
  const paymentSession = request.headers.get("x-payment-session")
  const authHeader = request.headers.get("authorization")

  if (!paymentSession && !authHeader) {
    // Return 402 Payment Required with x402 headers
    const response = new NextResponse("Payment Required", { status: 402 })

    // Standard x402 headers
    response.headers.set("WWW-Authenticate", `Bearer realm="x402"`)
    response.headers.set("X-Accept-Payment", "USDC")
    response.headers.set("X-Payment-Amount", route.price.toString())
    response.headers.set("X-Payment-Network", "base")
    response.headers.set("X-Payment-Address", process.env.X402_WALLET_ADDRESS || "")
    response.headers.set("X-Payment-Description", route.description)
    response.headers.set(
      "Access-Control-Expose-Headers",
      "WWW-Authenticate, X-Accept-Payment, X-Payment-Amount, X-Payment-Network, X-Payment-Address",
    )

    return response
  }

  // Verification is delegated to the specific API route via lib/payment.ts
  // to avoid Edge Runtime database connection limitations.
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match API routes that require payment
    "/api/analytics/:path*",
    "/api/campaigns/premium",
    "/api/campaigns/boost",
  ],
}
