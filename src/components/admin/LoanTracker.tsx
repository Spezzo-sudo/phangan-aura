"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Target, DollarSign } from "lucide-react";

interface LoanSettings {
    initial_amount: number;
    repaid_amount: number;
    currency: string;
    start_date: string;
}

export function LoanTracker() {
    const [loanData, setLoanData] = useState<LoanSettings | null>(null);
    const [companyShare, setCompanyShare] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch loan settings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: settings } = await (supabase as any)
                .from('company_settings')
                .select('setting_value')
                .eq('setting_key', 'loan_repayment')
                .single();

            if (settings) {
                setLoanData(settings.setting_value as LoanSettings);
            }

            // Calculate total company share from confirmed AND completed bookings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: bookings } = await (supabase as any)
                .from('bookings')
                .select('company_share, total_price')
                .in('status', ['confirmed', 'completed']);

            let totalShare = 0;

            if (bookings && bookings.length > 0) {
                bookings.forEach((booking: any) => {
                    // Use the stored company_share (correctly calculated on booking creation)
                    const share = booking.company_share ?? 0;
                    totalShare += share;
                });
            }

            setCompanyShare(totalShare);

        } catch (error) {
            console.error('Error fetching loan data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRepaidAmount = async (newAmount: number) => {
        if (!loanData) return;

        try {
            const updated = { ...loanData, repaid_amount: newAmount };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('company_settings')
                .update({ setting_value: updated })
                .eq('setting_key', 'loan_repayment');

            if (error) throw error;

            setLoanData(updated);
            alert('✅ Loan repayment updated!');
        } catch (error) {
            console.error('Error updating loan:', error);
            alert('❌ Failed to update');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!loanData) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
                <p className="text-red-800">Error loading loan data. Please check company_settings table.</p>
            </div>
        );
    }

    const remaining = loanData.initial_amount - loanData.repaid_amount;
    const progressPercent = (loanData.repaid_amount / loanData.initial_amount) * 100;
    const availableForRepayment = Math.max(0, companyShare - loanData.repaid_amount);

    // Estimate months until paid off (based on current company share accumulation)
    const monthsActive = Math.max(1, Math.ceil((new Date().getTime() - new Date(loanData.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const avgSharePerMonth = companyShare / monthsActive;
    const estimatedMonthsLeft = avgSharePerMonth > 0 ? Math.ceil(remaining / avgSharePerMonth) : 0;

    return (
        <div className="space-y-6">
            {/* Main Loan Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-8 rounded-2xl text-white shadow-xl">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="text-sm opacity-90 mb-2">Investor Loan</div>
                        <div className="text-5xl font-bold mb-2">
                            {remaining.toLocaleString()} ฿
                        </div>
                        <div className="text-sm opacity-80">
                            Remaining of {loanData.initial_amount.toLocaleString()} ฿ initial
                        </div>
                    </div>
                    <Target size={48} className="opacity-50" />
                </div>

                {/* Progress Bar */}
                <div className="bg-white/20 rounded-full h-4 overflow-hidden mb-3">
                    <div
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                    ></div>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="opacity-90">{progressPercent.toFixed(1)}% Repaid</span>
                    <span className="opacity-90">
                        {loanData.repaid_amount.toLocaleString()} ฿ paid back
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Company Share Accumulated */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="text-green-600" size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Company Share</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {companyShare.toLocaleString()} ฿
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-600">
                        Total accumulated from bookings
                    </div>
                </div>

                {/* Available for Repayment */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Available</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {availableForRepayment.toLocaleString()} ฿
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-600">
                        Can be used for loan repayment
                    </div>
                </div>

                {/* Months Until Paid Off */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Target className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Estimated Payoff</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {remaining > 0 && estimatedMonthsLeft > 0 ? `${estimatedMonthsLeft} mo` : remaining > 0 ? '∞' : 'PAID!'}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-600">
                        {avgSharePerMonth > 0 ? `Based on ${avgSharePerMonth.toLocaleString()}฿/mo avg` : 'No data yet'}
                    </div>
                </div>
            </div>

            {/* Repayment Action */}
            {remaining > 0 && availableForRepayment > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="font-bold text-gray-900 mb-3">Make Repayment</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        You have {availableForRepayment.toLocaleString()} ฿ available from company share.
                        How much would you like to repay?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const amount = prompt(`Enter repayment amount (max: ${availableForRepayment} ฿):`);
                                if (amount) {
                                    const numAmount = parseInt(amount);
                                    if (numAmount > 0 && numAmount <= availableForRepayment) {
                                        updateRepaidAmount(loanData.repaid_amount + numAmount);
                                    } else {
                                        alert('Invalid amount');
                                    }
                                }
                            }}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                        >
                            Custom Amount
                        </button>
                        <button
                            onClick={() => updateRepaidAmount(loanData.repaid_amount + Math.min(availableForRepayment, remaining))}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
                        >
                            Pay All Available ({Math.min(availableForRepayment, remaining).toLocaleString()} ฿)
                        </button>
                    </div>
                </div>
            )}

            {/* Fully Paid Celebration */}
            {remaining <= 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-8 rounded-2xl text-center text-white">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-2">Loan Fully Repaid!</h2>
                    <p className="text-lg opacity-90">
                        Congratulations! The {loanData.initial_amount.toLocaleString()} ฿ investor loan has been fully repaid.
                    </p>
                </div>
            )}

            {/* Info Box if no bookings yet */}
            {companyShare === 0 && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                        <div className="text-blue-600 text-2xl">ℹ️</div>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-2">No Revenue Yet</h3>
                            <p className="text-sm text-blue-800">
                                Company share will accumulate automatically as bookings are confirmed.
                                Each booking contributes approximately 46% to the company share after staff commission (40%),
                                transport fees (100 THB), and Stripe fees.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
