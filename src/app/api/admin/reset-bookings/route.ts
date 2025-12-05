import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createClient();

    try {
        // 1. Check Auth & Admin Permission
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check if user is admin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
        }

        // 3. Delete all bookings
        const { error: bookingsError } = await supabase
            .from("bookings")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all (dummy condition)

        if (bookingsError) {
            throw bookingsError;
        }

        // 4. Delete all orders (if table exists)
        try {
            const { error: ordersError } = await supabase
                .from("orders")
                .delete()
                .neq("id", "00000000-0000-0000-0000-000000000000");

            // Ignore error if table doesn't exist
            if (ordersError && !ordersError.message.includes("does not exist")) {
                console.error("Orders delete error:", ordersError);
            }
        } catch (e) {
            console.log("Orders table might not exist, skipping...");
        }

        // 5. Optional: Delete blockers
        try {
            const { error: blockersError } = await supabase
                .from("blockers")
                .delete()
                .neq("id", "00000000-0000-0000-0000-000000000000");

            if (blockersError && !blockersError.message.includes("does not exist")) {
                console.error("Blockers delete error:", blockersError);
            }
        } catch (e) {
            console.log("Blockers table might not exist, skipping...");
        }

        // 6. Get counts
        const { count: bookingsCount } = await supabase
            .from("bookings")
            .select("*", { count: 'exact', head: true });

        return NextResponse.json({
            success: true,
            message: "All bookings, orders, and blockers have been deleted",
            remainingBookings: bookingsCount || 0
        });

    } catch (error: any) {
        console.error("Reset error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
