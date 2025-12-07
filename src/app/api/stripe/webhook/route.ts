import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripeClient } from '@/lib/stripe';

export const runtime = 'nodejs';

const stripe = getStripeClient();

async function updateOrderToPaid(orderId: string, session: Stripe.Checkout.Session) {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error } = await (supabase as any)
        .from('orders')
        .select('id, payment_status, status, items, stripe_payment_intent')
        .eq('id', orderId)
        .single();

    if (error || !order) {
        console.error('Order fetch error', error);
        return;
    }

    if (order.payment_status === 'paid' || order.status === 'confirmed') return;

    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : null;
    if (order.stripe_payment_intent && paymentIntent && order.stripe_payment_intent === paymentIntent) {
        return;
    }

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
            stripe_payment_intent: paymentIntent,
        })
        .eq('id', orderId);
}

async function markOrderFailed(orderId: string, status: string) {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error } = await (supabase as any)
        .from('orders')
        .select('payment_status, status')
        .eq('id', orderId)
        .single();

    if (error || !order) {
        console.error('Order fetch for failure update error', error);
        return;
    }

    if (order.payment_status === 'paid' || order.status === 'confirmed') {
        return;
    }

    await (supabase as any)
        .from('orders')
        .update({
            payment_status: status,
            status: 'cancelled',
        })
        .eq('id', orderId);
}

async function hasProcessedEvent(stripeEventId: string, paymentIntentId?: string | null) {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (supabase as any)
        .from('webhook_events')
        .select('id')
        .or(paymentIntentId
            ? `stripe_event_id.eq.${stripeEventId},payment_intent_id.eq.${paymentIntentId}`
            : `stripe_event_id.eq.${stripeEventId}`)
        .maybeSingle();

    const { data, error } = await query;

    if (error) {
        console.error('Webhook idempotency lookup failed', error);
    }

    return Boolean(data);
}

async function recordEvent(stripeEventId: string, paymentIntentId: string | null, orderId: string | null, eventType: string, status: string) {
    const supabase = createAdminClient();
    const conflictTarget = paymentIntentId ? 'payment_intent_id' : 'stripe_event_id';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('webhook_events')
        .upsert({
            stripe_event_id: stripeEventId,
            payment_intent_id: paymentIntentId,
            order_id: orderId,
            event_type: eventType,
            status,
        }, { onConflict: conflictTarget });

    if (error) {
        console.error('Failed to record webhook event', error);
    }
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
        const paymentIntentId = (() => {
            if ('payment_intent' in event.data.object && typeof event.data.object.payment_intent === 'string') {
                return event.data.object.payment_intent;
            }
            if ('id' in event.data.object && (event.data.object as Stripe.PaymentIntent).object === 'payment_intent') {
                return (event.data.object as Stripe.PaymentIntent).id;
            }
            return null;
        })();

        if (await hasProcessedEvent(event.id, paymentIntentId)) {
            return NextResponse.json({ skipped: true, reason: 'duplicate_event' });
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.order_id;
                if (orderId) {
                    await updateOrderToPaid(orderId, session);
                }
                await recordEvent(event.id, typeof session.payment_intent === 'string' ? session.payment_intent : null, orderId || null, event.type, 'processed');
                break;
            }
            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.order_id;
                if (orderId) {
                    await markOrderFailed(orderId, 'expired');
                }
                await recordEvent(event.id, typeof session.payment_intent === 'string' ? session.payment_intent : null, orderId || null, event.type, 'expired');
                break;
            }
            case 'payment_intent.payment_failed': {
                const intent = event.data.object as Stripe.PaymentIntent;
                const orderId = intent.metadata?.order_id;
                if (orderId) {
                    await markOrderFailed(orderId, 'failed');
                }
                await recordEvent(event.id, intent.id, orderId || null, event.type, 'failed');
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
