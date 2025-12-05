import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Update booking status
export async function PATCH(request: Request) {
    const supabase = await createClient();

    try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is staff or admin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
            return NextResponse.json({ error: "Forbidden - Staff only" }, { status: 403 });
        }

        const body = await request.json();
        const { booking_id, status } = body;

        if (!booking_id || !status) {
            return NextResponse.json({ error: "Missing booking_id or status" }, { status: 400 });
        }

        // Valid statuses
        const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Update booking
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("bookings")
            .update({ status })
            .eq("id", booking_id)
            .select()
            .single();

        if (error) {
            console.error("Update error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, booking: data });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Booking update error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
