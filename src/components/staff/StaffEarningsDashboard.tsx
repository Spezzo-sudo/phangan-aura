"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, CreditCard, Banknote, TrendingUp } from "lucide-react";

interface EarningsData {
    // Cash bookings (I have the money)
    cashBookings: number;
    cashCollected: number;
    iKeepFromCash: number;
    iOweCompany: number;

    // Online bookings (Company has the money)
    onlineBookings: number;
    onlineCollectedByCompany: number;
    companyOwesMe: number;

    // Net balance
    netBalance: number;  // Positive = I owe Company, Negative = Company owes me

    // Totals
    totalEarnings: number;  // Commission + Transport (what I keep)
    totalSettled: number;   // Already paid out
    totalPending: number;   // Waiting for settlement

    bookings: Array<{
        id: string;
        date: string;
        service: string;
        paymentMethod: string;
        totalPrice: number;
        myCommission: number;
        myTransport: number;
        companyShare: number;
        isSettled: boolean;
    }>;
}

interface StaffEarningsDashboardProps {
    staffId: string;
}

export function StaffEarningsDashboard({ staffId }: StaffEarningsDashboardProps) {
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');
    const supabase = createClient();

    useEffect(() => {
        fetchEarnings();
    }, [staffId, filter]);

    const fetchEarnings = async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const query = (supabase as any)
                .from('bookings')
                .select(`
                    id,
                    start_time,
                    payment_method,
                    total_price,
                    staff_commission,
                    transport_fee,
                    company_share,
                    paid_to_staff,
                    status,
                    service:services!bookings_service_id_fkey(title)
                `)
                .eq('staff_id', staffId)
                .in('status', ['confirmed', 'completed']);

            if (filter === 'pending') {
                query.or('paid_to_staff.is.null,paid_to_staff.eq.false');
            }

            const { data: bookings, error } = await query;

            if (error) throw error;

            if (!bookings || bookings.length === 0) {
                setEarnings({
                    cashBookings: 0,
                    cashCollected: 0,
                    iKeepFromCash: 0,
                    iOweCompany: 0,
                    onlineBookings: 0,
                    onlineCollectedByCompany: 0,
                    companyOwesMe: 0,
                    netBalance: 0,
                    totalEarnings: 0,
                    totalSettled: 0,
                    totalPending: 0,
                    bookings: []
                });
                setLoading(false);
                return;
            }

            let cashBookings = 0;
            let cashCollected = 0;
            let iKeepFromCash = 0;
            let iOweCompany = 0;
            let onlineBookings = 0;
            let onlineCollectedByCompany = 0;
            let companyOwesMe = 0;
            let totalEarnings = 0;
            let totalSettled = 0;
            let totalPending = 0;

            const bookingsList: EarningsData['bookings'] = [];

            bookings.forEach((booking: any) => {
                const totalPrice = booking.total_price || 0;
                const commission = booking.staff_commission || 0;
                const transportFee = booking.transport_fee || 0;
                const companyShare = booking.company_share || 0;
                const isSettled = booking.paid_to_staff === true;

                const myEarnings = commission + transportFee;
                totalEarnings += myEarnings;

                if (isSettled) {
                    totalSettled += myEarnings;
                } else {
                    totalPending += myEarnings;
                }

                bookingsList.push({
                    id: booking.id,
                    date: booking.start_time,
                    service: booking.service?.title || 'Unknown',
                    paymentMethod: booking.payment_method || 'cash',
                    totalPrice,
                    myCommission: commission,
                    myTransport: transportFee,
                    companyShare,
                    isSettled
                });

                if (booking.payment_method === 'cash') {
                    cashBookings++;
                    cashCollected += totalPrice;
                    iKeepFromCash += myEarnings;

                    if (!isSettled) {
                        iOweCompany += companyShare;
                    }
                } else {
                    onlineBookings++;
                    onlineCollectedByCompany += totalPrice;

                    if (!isSettled) {
                        companyOwesMe += myEarnings;
                    }
                }
            });

            setEarnings({
                cashBookings,
                cashCollected,
                iKeepFromCash,
                iOweCompany,
                onlineBookings,
                onlineCollectedByCompany,
                companyOwesMe,
                netBalance: iOweCompany - companyOwesMe,
                totalEarnings,
                totalSettled,
                totalPending,
                bookings: bookingsList
            });
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aura-teal"></div>
            </div>
        );
    }

    if (!earnings) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">My Earnings</h2>
                    <p className="text-gray-600">Track your income and settlements</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                            ? 'bg-aura-teal text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-aura-teal text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-aura-teal to-teal-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign size={24} />
                        <span className="text-xs opacity-80">Total</span>
                    </div>
                    <div className="text-3xl font-bold">{earnings.totalEarnings.toLocaleString()} ฿</div>
                    <div className="text-xs opacity-90 mt-1">My Total Earnings</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp size={24} className="text-green-600" />
                        <span className="text-xs text-gray-500">Settled</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{earnings.totalSettled.toLocaleString()} ฿</div>
                    <div className="text-xs text-gray-500 mt-1">Already Paid</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign size={24} className="text-orange-600" />
                        <span className="text-xs text-gray-500">Pending</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{earnings.totalPending.toLocaleString()} ฿</div>
                    <div className="text-xs text-gray-500 mt-1">Awaiting Settlement</div>
                </div>
            </div>

            {/* NET BALANCE */}
            {earnings.netBalance !== 0 && (
                <div className={`p-6 rounded-xl text-white ${earnings.netBalance > 0
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-90 mb-1">Current Balance</div>
                            <div className="text-4xl font-bold">{Math.abs(earnings.netBalance).toLocaleString()} ฿</div>
                            <div className="text-sm opacity-90 mt-2">
                                {earnings.netBalance > 0
                                    ? '📤 You owe the company (from cash bookings)'
                                    : '📥 Company owes you (from online bookings)'}
                            </div>
                        </div>
                        <DollarSign size={48} className="opacity-50" />
                    </div>
                </div>
            )}

            {/* CASH & ONLINE BREAKDOWN */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* CASH BOOKINGS */}
                {earnings.cashBookings > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Banknote size={20} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Cash Bookings</h3>
                                <p className="text-xs text-gray-500">{earnings.cashBookings} bookings</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">I Collected</span>
                                <span className="font-medium">{earnings.cashCollected.toLocaleString()} ฿</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>I Keep (Commission + Transport)</span>
                                <span className="font-medium">-{earnings.iKeepFromCash.toLocaleString()} ฿</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-bold text-red-600">
                                <span>I Owe Company</span>
                                <span>{earnings.iOweCompany.toLocaleString()} ฿</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ONLINE BOOKINGS */}
                {earnings.onlineBookings > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <CreditCard size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Online Bookings</h3>
                                <p className="text-xs text-gray-500">{earnings.onlineBookings} bookings</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Company Collected</span>
                                <span className="font-medium">{earnings.onlineCollectedByCompany.toLocaleString()} ฿</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>My Earnings</span>
                                <span className="font-medium">{earnings.companyOwesMe.toLocaleString()} ฿</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-bold text-green-600">
                                <span>Company Owes Me</span>
                                <span>{earnings.companyOwesMe.toLocaleString()} ฿</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOOKINGS TABLE */}
            {earnings.bookings.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900">Booking Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Service</th>
                                    <th className="p-3">Method</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3 text-right">My Commission</th>
                                    <th className="p-3 text-right">Transport</th>
                                    <th className="p-3 text-right">My Earnings</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.bookings.map(booking => (
                                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-3 text-gray-600">
                                            {new Date(booking.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 text-gray-900">{booking.service}</td>
                                        <td className="p-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${booking.paymentMethod === 'cash'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {booking.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-medium">{booking.totalPrice.toLocaleString()} ฿</td>
                                        <td className="p-3 text-right">{booking.myCommission.toLocaleString()} ฿</td>
                                        <td className="p-3 text-right">{booking.myTransport.toLocaleString()} ฿</td>
                                        <td className="p-3 text-right font-bold text-aura-teal">
                                            {(booking.myCommission + booking.myTransport).toLocaleString()} ฿
                                        </td>
                                        <td className="p-3 text-center">
                                            {booking.isSettled ? (
                                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    ✓ Settled
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {earnings.bookings.length === 0 && (
                <div className="bg-white p-12 rounded-xl text-center border border-gray-200">
                    <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No {filter === 'pending' ? 'pending' : ''} bookings found</p>
                </div>
            )}
        </div>
    );
}
