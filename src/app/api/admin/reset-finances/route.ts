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

        // 3. Reset loan_repayment in company_settings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: resetError } = await (supabase as any)
            .from('company_settings')
            .update({
                setting_value: {
                    initial_amount: 0,
                    repaid_amount: 0,
                    currency: 'THB',
                    start_date: new Date().toISOString()
                }
            })
            .eq('setting_key', 'loan_repayment');

        if (resetError) {
            throw resetError;
        }

        return NextResponse.json({
            success: true,
            message: "Loan repayment data has been reset to zero"
        });

    } catch (error: any) {
        console.error("Reset finances error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
