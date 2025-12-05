"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Calendar, User, CreditCard, Banknote } from "lucide-react";

interface StaffPayout {
    staffId: string;
    staffName: string;
    cashBookings: number;
    cashCollectedByStaff: number;
    staffKeepsFromCash: number;
    staffOwesCompany: number;
    onlineBookings: number;
    onlineCollectedByCompany: number;
    companyKeepsFromOnline: number;
    companyOwesStaff: number;
    netBalance: number;
    bookings: Array<{
        id: string;
        date: string;
        service: string;
        paymentMethod: string;
        totalPrice: number;
        commission: number;
        transportFee: number;
        companyShare: number;
        isPaid: boolean;
    }>;
}

export function StaffPayoutDashboard() {
    const [payouts, setPayouts] = useState<StaffPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'unpaid' | 'all'>('unpaid');
    const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
    const supabase = createClient();

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let query = (supabase as any)
                .from('bookings')
                .select('id, start_time, payment_method, total_price, staff_commission, transport_fee, company_share, paid_to_staff, status, staff_id, service_id')
                .in('status', ['confirmed', 'completed'])
                .not('staff_id', 'is', null);

            if (filter === 'unpaid') {
                query = query.or('paid_to_staff.is.null,paid_to_staff.eq.false');
            }

            const { data: bookings, error } = await query;

            if (error) {
                console.error('Database error:', error);
                setPayouts([]);
                setLoading(false);
                return;
            }

            if (!bookings || bookings.length === 0) {
                setPayouts([]);
                setLoading(false);
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const staffIds = [...new Set(bookings.map((b: any) => b.staff_id).filter(Boolean))];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: staffData } = await (supabase as any)
                .from('profiles')
                .select('id, full_name')
                .in('id', staffIds);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const serviceIds = [...new Set(bookings.map((b: any) => b.service_id).filter(Boolean))];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: serviceData } = await (supabase as any)
                .from('services')
                .select('id, title')
                .in('id', serviceIds);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const staffMap = new Map(staffData?.map((s: any) => [s.id, s.full_name]) || []);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const serviceMap = new Map(serviceData?.map((s: any) => [s.id, s.title]) || []);

            const payoutMap = new Map<string, StaffPayout>();

            bookings.forEach((booking: any) => {
                const staffId = booking.staff_id;
                if (!staffId) return;

                if (!payoutMap.has(staffId)) {
                    payoutMap.set(staffId, {
                        staffId,
                        staffName: (staffMap.get(staffId) as string) || 'Unknown',
                        cashBookings: 0,
                        cashCollectedByStaff: 0,
                        staffKeepsFromCash: 0,
                        staffOwesCompany: 0,
                        onlineBookings: 0,
                        onlineCollectedByCompany: 0,
                        companyKeepsFromOnline: 0,
                        companyOwesStaff: 0,
                        netBalance: 0,
                        bookings: []
                    });
                }

                const payout = payoutMap.get(staffId)!;
                const totalPrice = booking.total_price || 0;
                const commission = booking.staff_commission || 0;
                const transportFee = booking.transport_fee || 0;
                const companyShare = booking.company_share || 0;
                const isPaid = booking.paid_to_staff === true;

                payout.bookings.push({
                    id: booking.id,
                    date: booking.start_time,
                    service: (serviceMap.get(booking.service_id) as string) || 'Unknown',
                    paymentMethod: booking.payment_method || 'cash',
                    totalPrice,
                    commission,
                    transportFee,
                    companyShare,
                    isPaid
                });

                if (booking.payment_method === 'cash') {
                    payout.cashBookings++;
                    payout.cashCollectedByStaff += totalPrice;
                    payout.staffKeepsFromCash += (commission + transportFee);
                    if (!isPaid) payout.staffOwesCompany += companyShare;
                } else {
                    payout.onlineBookings++;
                    payout.onlineCollectedByCompany += totalPrice;
                    payout.companyKeepsFromOnline += companyShare;
                    if (!isPaid) payout.companyOwesStaff += (commission + transportFee);
                }
            });

            payoutMap.forEach(p => {
                p.netBalance = p.staffOwesCompany - p.companyOwesStaff;
            });

            setPayouts(Array.from(payoutMap.values()));
        } catch (error) {
            console.error('Fetch error:', error);
            setPayouts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
        setSelectedBookings(new Set());
    }, [filter]);

    const toggleBooking = (bookingId: string) => {
        setSelectedBookings(prev => {
            const newSet = new Set(prev);
            if (newSet.has(bookingId)) {
                newSet.delete(bookingId);
            } else {
                newSet.add(bookingId);
            }
            return newSet;
        });
    };

    const toggleAllForStaff = (staffId: string) => {
        const payout = payouts.find(p => p.staffId === staffId);
        if (!payout) return;

        const unpaidBookingIds = payout.bookings.filter(b => !b.isPaid).map(b => b.id);
        const allSelected = unpaidBookingIds.every(id => selectedBookings.has(id));

        setSelectedBookings(prev => {
            const newSet = new Set(prev);
            if (allSelected) {
                unpaidBookingIds.forEach(id => newSet.delete(id));
            } else {
                unpaidBookingIds.forEach(id => newSet.add(id));
            }
            return newSet;
        });
    };

    const markSelectedAsSettled = async (staffId: string) => {
        const staffBookings = payouts.find(p => p.staffId === staffId)?.bookings || [];
        const selectedIds = staffBookings.filter(b => selectedBookings.has(b.id)).map(b => b.id);

        if (selectedIds.length === 0) {
            alert('No bookings selected');
            return;
        }

        if (!confirm(`Mark ${selectedIds.length} booking(s) as settled?`)) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('bookings')
                .update({
                    paid_to_staff: true,
                    paid_to_staff_at: new Date().toISOString()
                })
                .in('id', selectedIds);

            if (error) throw error;

            alert(`✅ ${selectedIds.length} booking(s) marked as settled!`);
            setSelectedBookings(new Set());
            fetchPayouts();
        } catch (error) {
            console.error(error);
            alert('❌ Failed to mark as settled');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aura-teal"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Staff Payouts</h2>
                    <p className="text-gray-600">Who owes whom - Select bookings to settle</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('unpaid')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unpaid' ? 'bg-aura-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Unsettled Only
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-aura-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                </div>
            </div>

            {payouts.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border border-gray-200">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No {filter === 'unpaid' ? 'unsettled' : ''} bookings found</p>
                </div>
            ) : (
                payouts.map(p => {
                    const unpaidCount = p.bookings.filter(b => !b.isPaid).length;
                    const selectedCount = p.bookings.filter(b => selectedBookings.has(b.id)).length;
                    const allUnpaidSelected = unpaidCount > 0 && p.bookings.filter(b => !b.isPaid).every(b => selectedBookings.has(b.id));

                    return (
                        <div key={p.staffId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* HEADER */}
                            <div className="p-6 bg-gray-50 border-b border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-aura-teal/10 rounded-full flex items-center justify-center">
                                            <User className="text-aura-teal" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{p.staffName}</h3>
                                            <p className="text-sm text-gray-600">
                                                {p.bookings.length} booking{p.bookings.length !== 1 ? 's' : ''}
                                                {unpaidCount > 0 && ` • ${unpaidCount} unsettled`}
                                                {selectedCount > 0 && ` • ${selectedCount} selected`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 mb-1">Net Balance</div>
                                        <div className={`text-2xl font-bold ${p.netBalance > 0 ? 'text-red-600' :
                                            p.netBalance < 0 ? 'text-green-600' :
                                                'text-gray-600'
                                            }`}>
                                            {Math.abs(p.netBalance).toLocaleString()} ฿
                                        </div>
                                        <div className="text-xs mt-1">
                                            {p.netBalance > 0 && <span className="text-red-600">Staff owes Company</span>}
                                            {p.netBalance < 0 && <span className="text-green-600">Company owes Staff</span>}
                                            {p.netBalance === 0 && <span className="text-gray-500">All Settled</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CASH & ONLINE SUMMARY */}
                            <div className="p-6 grid md:grid-cols-2 gap-6 border-b border-gray-200">
                                {p.cashBookings > 0 && (
                                    <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Banknote size={18} className="text-green-600" />
                                            <h4 className="font-bold text-gray-900">Cash Bookings ({p.cashBookings})</h4>
                                        </div>
                                        <div className="text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Staff Collected</span>
                                                <span className="font-medium">{p.cashCollectedByStaff.toLocaleString()} ฿</span>
                                            </div>
                                            <div className="flex justify-between text-green-600">
                                                <span>Staff Keeps</span>
                                                <span className="font-medium">-{p.staffKeepsFromCash.toLocaleString()} ฿</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-green-200 font-bold text-red-600">
                                                <span>Staff Owes Company</span>
                                                <span>{p.staffOwesCompany.toLocaleString()} ฿</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {p.onlineBookings > 0 && (
                                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CreditCard size={18} className="text-blue-600" />
                                            <h4 className="font-bold text-gray-900">Online Bookings ({p.onlineBookings})</h4>
                                        </div>
                                        <div className="text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Company Collected</span>
                                                <span className="font-medium">{p.onlineCollectedByCompany.toLocaleString()} ฿</span>
                                            </div>
                                            <div className="flex justify-between text-green-600">
                                                <span>Company Keeps</span>
                                                <span className="font-medium">-{p.companyKeepsFromOnline.toLocaleString()} ฿</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-blue-200 font-bold text-red-600">
                                                <span>Company Owes Staff</span>
                                                <span>{p.companyOwesStaff.toLocaleString()} ฿</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* BOOKINGS TABLE */}
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-gray-900">Booking Details</h4>
                                    {unpaidCount > 0 && (
                                        <button
                                            onClick={() => toggleAllForStaff(p.staffId)}
                                            className="text-sm text-aura-teal hover:text-teal-700 font-medium"
                                        >
                                            {allUnpaidSelected ? 'Deselect All' : 'Select All Unpaid'}
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                                                <th className="p-3 w-10"></th>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Service</th>
                                                <th className="p-3">Method</th>
                                                <th className="p-3 text-right">Total</th>
                                                <th className="p-3 text-right">Commission</th>
                                                <th className="p-3 text-right">Transport</th>
                                                <th className="p-3 text-right">Company</th>
                                                <th className="p-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {p.bookings.map(booking => (
                                                <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="p-3">
                                                        {!booking.isPaid && (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedBookings.has(booking.id)}
                                                                onChange={() => toggleBooking(booking.id)}
                                                                className="w-4 h-4 text-aura-teal rounded focus:ring-aura-teal cursor-pointer"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-gray-600">
                                                        {new Date(booking.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 text-gray-900 font-medium">{booking.service}</td>
                                                    <td className="p-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${booking.paymentMethod === 'cash'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {booking.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right font-medium">{booking.totalPrice.toLocaleString()} ฿</td>
                                                    <td className="p-3 text-right">{booking.commission.toLocaleString()} ฿</td>
                                                    <td className="p-3 text-right">{booking.transportFee.toLocaleString()} ฿</td>
                                                    <td className="p-3 text-right">{booking.companyShare.toLocaleString()} ฿</td>
                                                    <td className="p-3 text-center">
                                                        {booking.isPaid ? (
                                                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                                <Check size={12} /> Settled
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

                                {/* SETTLE BUTTON */}
                                {selectedCount > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => markSelectedAsSettled(p.staffId)}
                                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} />
                                            Mark {selectedCount} Selected as Settled
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
