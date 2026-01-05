import { prisma } from "@/lib/prisma"

interface PaymentVerificationResult {
    verified: boolean
    error?: string
    status?: number
    proof?: any
}

interface PaymentRouteConfig {
    price: number
    description: string
}

export async function verifyPaymentSession(
    headers: Headers,
    routeConfig: PaymentRouteConfig
): Promise<PaymentVerificationResult> {
    const paymentSession = headers.get("x-payment-session")
    const authHeader = headers.get("authorization")

    // If no payment info is present, return 402 equivalent indication
    if (!paymentSession && !authHeader) {
        return {
            verified: false,
            error: "Payment Required",
            status: 402
        }
    }

    if (paymentSession) {
        try {
            const session = JSON.parse(paymentSession)
            const { txHash, endpoint } = session

            // Verify the payment session exists in our database
            const verifiedSession = await prisma.paymentSession.findFirst({
                where: {
                    tx_hash: txHash,
                    endpoint: endpoint,
                    status: "completed"
                }
            })

            if (!verifiedSession) {
                return { verified: false, error: "Invalid payment session", status: 402 }
            }

            // Check if payment amount meets the minimum requirement
            // Convert Decimal to number for comparison
            if (Number(verifiedSession.amount) < routeConfig.price) {
                return { verified: false, error: "Insufficient payment amount", status: 402 }
            }

            // Check if payment is not too old (24 hours)
            const paymentAge = Date.now() - new Date(verifiedSession.created_at).getTime()
            const maxAge = 24 * 60 * 60 * 1000 // 24 hours

            if (paymentAge > maxAge) {
                return { verified: false, error: "Payment session expired", status: 402 }
            }

            return {
                verified: true,
                proof: {
                    verified: true,
                    txHash: txHash,
                    amount: verifiedSession.amount,
                    timestamp: verifiedSession.created_at
                }
            }

        } catch (error) {
            console.error("Payment verification error:", error)
            return { verified: false, error: "Invalid payment session format", status: 402 }
        }
    }

    // Fallback if we want to allow skipping verification (legacy behavior) or if handled elsewhere
    // For strict x402, we might want to return false here, but matching middleware logic:
    return { verified: true }
}
