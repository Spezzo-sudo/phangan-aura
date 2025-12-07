import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    apiVersion: '2024-10-28.acacia' as any,
});

async function updateOrderToPaid(orderId: string, session: Stripe.Checkout.Session) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error } = await (supabase as any)
        .from('orders')
        .select('id, payment_status, status, items')
        .eq('id', orderId)
        .single();

    if (error || !order) {
        console.error('Order fetch error', error);
        return;
    }

    if (order.payment_status === 'paid') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (order.items || []) as any[];
    for (const item of items) {
        if (!item?.product_id) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: product, error: productError } = await (supabase as any)
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

        if (productError) {
            console.error('Stock fetch error', productError);
            continue;
        }

        if (product?.stock_quantity !== null) {
            const newStock = Math.max(0, product.stock_quantity - (item.quantity || 0));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.product_id);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('orders')
        .update({
            payment_status: 'paid',
            status: 'confirmed',
            stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        })
        .eq('id', orderId);
}

async function markOrderFailed(orderId: string, status: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('orders')
        .update({
            payment_status: status,
            status: 'cancelled',
        })
        .eq('id', orderId);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.order_id;
                if (orderId) {
                    await updateOrderToPaid(orderId, session);
                }
                break;
            }
            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.order_id;
                if (orderId) {
                    await markOrderFailed(orderId, 'expired');
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const intent = event.data.object as Stripe.PaymentIntent;
                const orderId = intent.metadata?.order_id;
                if (orderId) {
                    await markOrderFailed(orderId, 'failed');
                }
                break;
            }
            default:
                break;
        }
    } catch (error) {
        console.error('Webhook handling error', error);
        return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
