import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    apiVersion: '2024-10-28.acacia' as any,
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get request body
        const body = await request.json();
        const { items, customerInfo } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        // 1. Validate Prices & Check Stock
        const productIds = items.map((i: any) => i.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: dbProducts, error: productsError } = await (supabase as any)
            .from('products')
            .select('id, price_thb, stock_quantity, name')
            .in('id', productIds);

        if (productsError || !dbProducts) {
            return NextResponse.json({ error: 'Failed to validate products' }, { status: 500 });
        }

        let calculatedSubtotal = 0;
        const validatedItems = [];

        for (const item of items) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbProduct = dbProducts.find((p: any) => p.id === item.id);

            if (!dbProduct) {
                return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
            }

            // Check Stock
            if (dbProduct.stock_quantity !== null && dbProduct.stock_quantity < item.quantity) {
                return NextResponse.json({
                    error: `Insufficient stock for ${typeof dbProduct.name === 'string' ? dbProduct.name : 'product'}. Only ${dbProduct.stock_quantity} left.`
                }, { status: 400 });
            }

            // Use DB price for security
            calculatedSubtotal += dbProduct.price_thb * item.quantity;
            validatedItems.push({
                ...item,
                price_thb: dbProduct.price_thb, // Override client price
                name: dbProduct.name // Use DB name
            });
        }

        // 🎯 SHOP COMMISSION CALCULATION
        const shopCommission = Math.round(calculatedSubtotal * 0.10); // 10% of products
        const stripeFee = body.paymentMethod === 'card'
            ? Math.round(calculatedSubtotal * 0.0365) + 11  // 3.65% + 11 THB (Thailand)
            : 0;
        const companyShare = calculatedSubtotal - shopCommission - stripeFee;

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create order in database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: order, error: orderError } = await (supabase as any)
            .from('orders')
            .insert({
                user_id: user.id,
                order_number: orderNumber,
                status: 'pending',
                payment_status: 'pending',
                payment_method: body.paymentMethod || 'card', // 'cash' or 'card'
                subtotal: calculatedSubtotal,
                total_amount: calculatedSubtotal,
                currency: 'thb',
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                customer_phone: customerInfo.phone || null,
                shipping_address: customerInfo.address || null,
                // Commission tracking
                staff_commission: shopCommission,
                stripe_fee: stripeFee,
                company_share: companyShare,
                items: validatedItems.map((item: any) => ({
                    product_id: item.id,
                    name: item.name,
                    price: item.price_thb,
                    quantity: item.quantity
                }))
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
        }

        // Handle Cash Payment (immediate capture)
        if (body.paymentMethod === 'cash') {
            for (const item of validatedItems) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const dbProduct = dbProducts.find((p: any) => p.id === item.id);
                if (dbProduct && dbProduct.stock_quantity !== null) {
                    const newStock = dbProduct.stock_quantity - item.quantity;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase as any)
                        .from('products')
                        .update({ stock_quantity: newStock })
                        .eq('id', item.id);
                }
            }

            return NextResponse.json({
                success: true,
                orderId: order.id,
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order_id=${order.id}`
            });
        }

        // Handle Stripe Payment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lineItems = validatedItems.map((item: any) => ({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: typeof item.name === 'string' ? item.name : 'Product', // Handle JSON name
                },
                unit_amount: item.price_thb * 100, // Stripe uses cents
            },
            quantity: item.quantity,
        }));

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
            customer_email: customerInfo.email,
            metadata: {
                order_id: order.id,
                order_number: orderNumber,
                user_id: user.id,
            },
        });

        // Update order with Stripe session ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('orders')
            .update({ stripe_session_id: session.id })
            .eq('id', order.id);

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
            orderId: order.id
        });

    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
