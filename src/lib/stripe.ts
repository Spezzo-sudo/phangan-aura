import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripeClient() {
    if (stripeClient) return stripeClient

    const secret = process.env.STRIPE_SECRET_KEY

    if (!secret) {
        throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    stripeClient = new Stripe(secret, {
        apiVersion: '2024-10-28.acacia' as Stripe.LatestApiVersion,
    })

    return stripeClient
}
