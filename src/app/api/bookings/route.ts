import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from 'stripe';
import { sendEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    apiVersion: '2024-10-28.acacia' as any, // Cast to avoid strict type mismatch if types are outdated
});

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { service_id, staff_id, date, time, address, lat, lng, location_notes, contact, addons, payment_method } = body;

        // Validate required fields
        if (!service_id || !date || !time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch Service Details (duration, price, title)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: service, error: serviceError } = await (supabase as any)
            .from("services")
            .select("duration_min, price_thb, title")
            .eq("id", service_id)
            .single();

        if (serviceError || !service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Helper to get English title from JSONB or string
        const getServiceTitle = (titleData: any) => {
            if (typeof titleData === 'string') return titleData;
            if (typeof titleData === 'object' && titleData !== null) {
                return titleData.en || titleData.de || titleData.th || 'Wellness Service';
            }
            return 'Wellness Service';
        };
        const serviceTitle = getServiceTitle(service.title);

        // 2. Calculate Start and End Time
        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + service.duration_min * 60000);

        // 3. Prepare Notes (optional contact info override)
        let notes = location_notes || "";
        if (contact && contact.name) {
            notes = `Contact: ${contact.name} (${contact.email}, ${contact.phone})${notes ? '\n' + notes : ''}`;
        }

        // 4. Calculate total price including addons
        const servicePrice = service.price_thb;
        let addonsPrice = 0;
        let materialCost = 0;

        if (addons && Array.isArray(addons)) {
            addons.forEach((addon: { price_thb: number, quantity: number }) => {
                const addonTotal = (addon.price_thb || 0) * (addon.quantity || 1);
                addonsPrice += addonTotal;
                materialCost += Math.round(addonTotal * 0.5); // 50% of addon price is material cost
            });
        }
        const totalPrice = servicePrice + addonsPrice;

        // 🎯 5. COMMISSION CALCULATION (Business Model)
        const staffCommission = Math.round(totalPrice * 0.4); // 40% of total price
        const transportFee = 100; // Fixed 100 THB

        // Stripe fee only if payment method is card (Thailand rates)
        const stripeFee = payment_method === 'card'
            ? Math.round(totalPrice * 0.0365) + 11  // 3.65% + 11 THB (Thailand)
            : 0;

        const companyShare = totalPrice - staffCommission - transportFee - stripeFee - materialCost;

        // 6. Insert Booking with Commission Data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("bookings")
            .insert({
                customer_id: user.id,
                service_id,
                staff_id: staff_id || null,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                location_address: address,
                location_lat: lat,
                location_lng: lng,
                notes,
                price_snapshot: servicePrice, // Service price only
                status: "pending",
                // New fields
                addons: addons || [],
                total_price: totalPrice,
                payment_method: payment_method || 'cash',
                staff_commission: staffCommission,
                transport_fee: transportFee,
                stripe_fee: stripeFee,
                material_cost: materialCost,
                company_share: companyShare,
                // Customer info
                customer_name: contact?.name || null,
                customer_email: contact?.email || null,
                customer_phone: contact?.phone || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            throw error;
        }

        // 7. Handle Stripe Payment
        if (payment_method === 'card') {
            const lineItems = [{
                price_data: {
                    currency: 'thb',
                    product_data: {
                        name: serviceTitle,
                    },
                    unit_amount: servicePrice * 100,
                },
                quantity: 1,
            }];

            if (addons && addons.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                addons.forEach((addon: any) => {
                    lineItems.push({
                        price_data: {
                            currency: 'thb',
                            product_data: {
                                name: addon.name, // Assuming addon.name is string, if JSONB need similar handler
                            },
                            unit_amount: addon.price_thb * 100,
                        },
                        quantity: addon.quantity,
                    });
                });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?booking_success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book?cancel=true`,
                customer_email: contact?.email || user.email,
                metadata: {
                    booking_id: data.id,
                    user_id: user.id,
                    type: 'booking'
                },
            });

            // Update booking with session ID
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('bookings').update({ stripe_session_id: session.id }).eq('id', data.id);

            // Send Email (Async)
            sendEmail({
                to: contact?.email || user.email,
                subject: "Booking Confirmation - Payment Required",
                html: `<p>Please complete your payment for ${serviceTitle}: <a href="${session.url}">Pay Now</a></p>`
            });

            return NextResponse.json({ success: true, booking: data, url: session.url, sessionId: session.id });
        }

        // 8. Handle Cash Payment (Email)
        sendEmail({
            to: contact?.email || user.email,
            subject: "Booking Confirmation",
            html: `<p>Your booking for ${serviceTitle} is confirmed. Please pay ${totalPrice} THB in cash upon arrival.</p>`
        });

        return NextResponse.json({ success: true, booking: data });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Booking error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
