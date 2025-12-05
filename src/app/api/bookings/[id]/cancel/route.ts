import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: bookingId } = await params;
    const supabase = await createClient();

    try {
        // 1. Check Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch Booking to check ownership
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: booking, error: fetchError } = await (supabase as any)
            .from("bookings")
            .select("customer_id, status")
            .eq("id", bookingId)
            .single();

        if (fetchError) {
            console.error("Fetch booking error:", fetchError);
            return NextResponse.json({
                error: "Booking not found",
                details: fetchError.message,
                bookingId
            }, { status: 404 });
        }

        if (!booking) {
            return NextResponse.json({
                error: "Booking not found",
                bookingId
            }, { status: 404 });
        }

        // 3. Check Permissions (Customer can only cancel own bookings)
        // Note: Admins should also be able to cancel, but we need to check role for that.
        // For now, let's assume this endpoint is primarily for the customer profile.
        // If we want admin support, we'd fetch the profile role too.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const isAdmin = profile?.role === 'admin';
        const isOwner = booking.customer_id === user.id;

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 4. Cancel Booking
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", bookingId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Cancel error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
