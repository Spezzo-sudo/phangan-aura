"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { Calendar, Clock, User, MapPin, XCircle, CheckCircle, CheckSquare, ShoppingBag } from "lucide-react";
import { useLocale } from "next-intl";
import { getLocalizedContent } from "@/lib/i18n-utils";

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    services: { title: any; duration_min: number; price_thb: number } | null;
    staff: { full_name: string | null } | null;
};

export function BookingManager() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const locale = useLocale();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const { data, error } = await supabase
            .from("bookings")
            .select(`
                *,
                services (title, duration_min, price_thb),
                staff:profiles!bookings_staff_id_fkey (full_name)
            `)
            .order("start_time", { ascending: false });

        if (error) {
            console.error("Error fetching bookings:", error);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setBookings(data as any || []);
        }
        setLoading(false);
    };

    const getServiceTitle = (service: Booking['services']) => {
        if (!service?.title) return "Unknown Service";
        return getLocalizedContent(service.title, locale);
    };

    const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
        if (!confirm(`Are you sure you want to mark this booking as ${status}?`)) return;

        if (status === 'cancelled') {
            try {
                const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                fetchBookings();
            } catch (e: any) {
                alert(e.message);
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from("bookings")
                .update({ status })
                .eq("id", id);

            if (error) {
                alert("Error updating status: " + error.message);
            } else {
                fetchBookings();
            }
        }
    };

    const completeBooking = async (id: string) => {
        if (!confirm("Mark this booking as completed? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/bookings/${id}/complete`, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to complete booking");
            }

            fetchBookings();
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-500">Loading bookings...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-serif font-bold text-gray-900">All Bookings</h2>
                <button onClick={fetchBookings} className="text-sm text-aura-teal hover:underline">Refresh</button>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No bookings found.</p>
                </div>
            ) : (
                bookings.map(booking => (
                    <div key={booking.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between hover:shadow-md transition-all">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {booking.status}
                                </span>
                                <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(booking.start_time).toLocaleDateString()}
                                    <Clock size={14} className="ml-2" />
                                    {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div>
                                <h3 className="font-bold text-xl text-gray-900">{getServiceTitle(booking.services)}</h3>
                                <p className="text-sm text-gray-500">{booking.services?.duration_min} min • {booking.services?.price_thb} THB</p>


                                {booking.addons && Array.isArray(booking.addons) && booking.addons.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">

                                        {(booking.addons as any[]).map((addon: { name: any, price: number, quantity?: number }, i: number) => (
                                            <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                <ShoppingBag size={12} />
                                                {getLocalizedContent(addon.name, locale)} ({(addon.price * (addon.quantity || 1))} ฿)
                                            </span>
                                        ))}
                                    </div>
                                )}


                                {booking.total_price && (
                                    <div className="mt-2 text-lg font-bold text-aura-teal">

                                        Total: {booking.total_price.toLocaleString()} ฿
                                    </div>
                                )}
                            </div>

                            <div className="text-sm text-gray-600 flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 font-medium">
                                    <User size={16} className="text-aura-teal" />
                                    Staff: <span className="text-gray-900">{booking.staff?.full_name || "Any Staff"}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-aura-teal mt-0.5" />
                                    <span>{booking.location_address || "No address"}</span>
                                </div>

                                {booking.customer_name && (
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />

                                        Customer: <span className="text-gray-900">{booking.customer_name}</span>

                                        {booking.customer_phone && <span className="text-gray-500">• {booking.customer_phone}</span>}
                                    </div>
                                )}
                                {booking.notes && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 whitespace-pre-wrap">
                                        {booking.notes}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                            {booking.status === 'pending' && (
                                <button
                                    onClick={() => updateStatus(booking.id, 'confirmed')}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
                                >
                                    <CheckCircle size={16} /> Confirm
                                </button>
                            )}

                            {booking.status === 'confirmed' && (
                                <button
                                    onClick={() => completeBooking(booking.id)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
                                >
                                    <CheckSquare size={16} /> Complete
                                </button>
                            )}

                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <button
                                    onClick={() => updateStatus(booking.id, 'cancelled')}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                                >
                                    <XCircle size={16} /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
