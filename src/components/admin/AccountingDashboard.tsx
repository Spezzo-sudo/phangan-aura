"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

interface AccountingSummary {
    totalRevenue: number;
    cashCollectedByStaff: number; // Money physically with staff
    onlineCollectedByCompany: number; // Money physically with company (Stripe)

    // Who owes whom?
    staffOwesCompany: number; // From cash bookings (Company Share)
    companyOwesStaff: number; // From online bookings (Commission)

    netTransfer: number; // Positive = Staff pays Company, Negative = Company pays Staff
}

export function AccountingDashboard() {
    const [summary, setSummary] = useState<AccountingSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchAccountingData();
    }, []);

    const fetchAccountingData = async () => {
        try {
            // Fetch all confirmed AND completed bookings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: bookings, error } = await (supabase as any)
                .from('bookings')
                .select('*')
                .in('status', ['confirmed', 'completed']);

            if (error) throw error;

            let totalRevenue = 0;
            let cashCollectedByStaff = 0;
            let onlineCollectedByCompany = 0;
            let staffOwesCompany = 0;
            let companyOwesStaff = 0;

            bookings?.forEach((b: any) => {
                const total = b.total_price || 0;
                const commission = b.staff_commission || 0;
                const transport = b.transport_fee || 0;
                const companyShare = b.company_share || 0;
                const isPaidToStaff = b.paid_to_staff === true;

                totalRevenue += total;

                if (b.payment_method === 'cash') {
                    // CASH BOOKING
                    // Staff collected full amount
                    cashCollectedByStaff += total;

                    // Staff keeps Commission + Transport
                    // Staff owes Company Share to Company
                    if (!isPaidToStaff) { // "Paid to staff" here means "Settled"
                        staffOwesCompany += companyShare;
                    }
                } else {
                    // ONLINE BOOKING (Card/Stripe)
                    // Company collected full amount
                    onlineCollectedByCompany += total;

                    // Company owes Commission + Transport to Staff
                    if (!isPaidToStaff) {
                        companyOwesStaff += (commission + transport);
                    }
                }
            });

            setSummary({
                totalRevenue,
                cashCollectedByStaff,
                onlineCollectedByCompany,
                staffOwesCompany,
                companyOwesStaff,
                netTransfer: staffOwesCompany - companyOwesStaff
            });

        } catch (error) {
            console.error('Error fetching accounting:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettle = async () => {
        if (!confirm("Are you sure you want to mark all pending balances as SETTLED? This cannot be undone.")) return;

        try {
            // Mark all confirmed bookings as paid_to_staff = true
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('bookings')
                .update({
                    paid_to_staff: true,
                    paid_to_staff_at: new Date().toISOString(),
                    payout_notes: 'Settled via Accounting Dashboard'
                })
                .eq('status', 'confirmed')
                .eq('paid_to_staff', false);

            if (error) throw error;

            alert("✅ All balances settled successfully!");
            fetchAccountingData();
        } catch (error) {
            alert("Error settling balances");
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading accounting data...</div>;
    if (!summary) return <div className="p-8 text-center">No data available</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Accounting & Reconciliation</h2>
                    <p className="text-gray-600">Track cash flows between Staff and Company</p>
                </div>
                <button
                    onClick={fetchAccountingData}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Main Balance Card */}
            <div className={`p-8 rounded-2xl text-white shadow-xl ${summary.netTransfer > 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium opacity-90">Net Balance to Settle</h3>
                    <DollarSign size={32} className="opacity-50" />
                </div>

                <div className="text-5xl font-bold mb-2">
                    {Math.abs(summary.netTransfer).toLocaleString()} THB
                </div>

                <div className="text-xl opacity-90 flex items-center gap-2">
                    {summary.netTransfer > 0 ? (
                        <>
                            <ArrowRight /> Staff pays Company
                        </>
                    ) : summary.netTransfer < 0 ? (
                        <>
                            <ArrowRight /> Company pays Staff
                        </>
                    ) : (
                        <>
                            <CheckCircle /> All Settled
                        </>
                    )}
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Cash Flow (Staff holds money) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Cash Bookings (Staff Collected)
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Cash Collected</span>
                            <span className="font-medium">{summary.cashCollectedByStaff.toLocaleString()} THB</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-gray-600">Staff Keeps (Commission)</span>
                            <span className="text-green-600">-{summary.cashCollectedByStaff - summary.staffOwesCompany} THB</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t bg-red-50 p-2 rounded">
                            <span className="text-red-700">Staff Owes Company</span>
                            <span className="text-red-700">{summary.staffOwesCompany.toLocaleString()} THB</span>
                        </div>
                    </div>
                </div>

                {/* Online Flow (Company holds money) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Online Bookings (Company Collected)
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Online Collected</span>
                            <span className="font-medium">{summary.onlineCollectedByCompany.toLocaleString()} THB</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-gray-600">Company Keeps (Share)</span>
                            <span className="text-green-600">-{summary.onlineCollectedByCompany - summary.companyOwesStaff} THB</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t bg-red-50 p-2 rounded">
                            <span className="text-red-700">Company Owes Staff</span>
                            <span className="text-red-700">{summary.companyOwesStaff.toLocaleString()} THB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settlement Action */}
            {summary.netTransfer !== 0 && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-gray-900">Settle All Accounts</h4>
                        <p className="text-sm text-gray-600">Mark all pending transactions as paid/received.</p>
                    </div>
                    <button
                        onClick={handleSettle}
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                    >
                        Mark as Settled
                    </button>
                </div>
            )}

            <div className="text-xs text-gray-400 text-center">
                This dashboard tracks all confirmed bookings. Use "Mark as Settled" after physical money transfer happens.
            </div>
        </div>
    );
}
