import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const items = body?.items || [];

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items to validate' }, { status: 400 });
        }

        const productIds = items.map((i: any) => i.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: dbProducts, error } = await (supabase as any)
            .from('products')
            .select('id, price_thb, stock_quantity, name, is_active')
            .in('id', productIds);

        if (error) {
            console.error('Cart validation error', error);
            return NextResponse.json({ error: 'Failed to validate cart' }, { status: 500 });
        }

        const sanitizedItems = [] as any[];
        const messages: string[] = [];

        for (const item of items) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbProduct = dbProducts?.find((p: any) => p.id === item.id);

            if (!dbProduct || dbProduct.is_active === false) {
                messages.push(`Removed unavailable item`);
                continue;
            }

            const availableStock = dbProduct.stock_quantity ?? null;
            const requested = Math.max(1, Number(item.quantity) || 1);
            const safeQuantity = availableStock === null ? requested : Math.min(requested, availableStock);

            if (availableStock !== null && requested > availableStock) {
                messages.push(`Adjusted ${typeof dbProduct.name === 'string' ? dbProduct.name : 'item'} to available stock (${availableStock}).`);
            }

            sanitizedItems.push({
                id: dbProduct.id,
                name: dbProduct.name,
                price_thb: dbProduct.price_thb,
                quantity: safeQuantity,
                maxQuantity: availableStock ?? undefined,
            });
        }

        if (sanitizedItems.length === 0) {
            return NextResponse.json({ error: 'Cart items are no longer available', messages }, { status: 410 });
        }

        return NextResponse.json({ items: sanitizedItems, messages });
    } catch (err) {
        console.error('Cart validation exception', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
