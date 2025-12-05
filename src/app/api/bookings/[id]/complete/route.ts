import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: bookingId } = await params;
    const supabase = await createClient();

    try {
        // 1. Check Auth (Admin or Staff)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Fetch Booking
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: booking, error: fetchError } = await (supabase as any)
            .from("bookings")
            .select("start_time, status")
            .eq("id", bookingId)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // 3. Plausibility Check
        const bookingTime = new Date(booking.start_time);
        const now = new Date();

        if (bookingTime > now) {
            return NextResponse.json({
                error: "Cannot mark a future booking as completed. Please wait until the booking time has passed."
            }, { status: 400 });
        }

        // 4. Update Status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
            .from("bookings")
            .update({ status: "completed" })
            .eq("id", bookingId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Complete booking error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
