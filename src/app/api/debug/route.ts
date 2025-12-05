import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    try {
        // 1. Get all profiles  
        const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        // 2. Get all bookings
        const { data: bookings } = await supabase
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false });

        // 3. Get all services
        const { data: services } = await supabase
            .from("services")
            .select("*");

        // 4. Get all staff_services
        const { data: staffServices } = await supabase
            .from("staff_services")
            .select("*");

        return NextResponse.json({
            success: true,
            profiles: profiles || [],
            bookings: bookings || [],
            services: services || [],
            staff_services: staffServices || [],
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Debug API error:", errorMessage, error);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
