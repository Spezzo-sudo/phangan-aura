"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Database } from "@/types/database";
import { Calendar, User as UserIcon, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BookingCard } from "@/components/profile/BookingCard";
import { useTranslations } from "next-intl";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'] & {
    services: { title: string; duration_min: number; price_thb: number } | null;
    staff: { full_name: string; avatar_url: string | null } | null;
};

export default function ProfilePage() {
    const [user, setUser] = useState<Profile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();
    const t = useTranslations('Profile');

    const fetchBookings = useCallback(async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("bookings")
            .select(`
                *,
                services!service_id (title, duration_min, price_thb),
                staff:profiles!staff_id (full_name, avatar_url)
            `)
            .eq("customer_id", userId)
            .order("start_time", { ascending: false });

        if (error) {
            console.error("Error fetching bookings:", error);
        } else {
            setBookings(data as Booking[] || []);
        }
        setLoading(false);
    }, [supabase]);

    const checkUser = useCallback(async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            router.push("/login");
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

        setUser(profile);
        if (profile) {
            fetchBookings(profile.id);
        }
    }, [supabase, router, fetchBookings]);

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    const cancelBooking = async (bookingId: string) => {
        try {
            const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: "POST",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to cancel booking");
            }

            // Refresh bookings
            if (user) {
                fetchBookings(user.id);
            }
            alert(t('cancel_success'));
        } catch (error: any) {
            console.error("Error cancelling booking:", error);
            alert(error.message || t('cancel_fail'));
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <AlertCircle className="text-yellow-500" size={20} />;
            case "confirmed":
                return <CheckCircle className="text-green-500" size={20} />;
            case "completed":
                return <CheckCircle className="text-blue-500" size={20} />;
            case "cancelled":
                return <XCircle className="text-red-500" size={20} />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "confirmed":
                return "bg-green-50 text-green-700 border-green-200";
            case "completed":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "cancelled":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <main className="min-h-screen bg-aura-sand">
            <Navbar />

            <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                        {t('title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('welcome', { name: user?.full_name || "Guest" })}
                    </p>
                </div>

                {/* User Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-aura-teal/10 flex items-center justify-center text-aura-te border-2 border-aura-teal/20">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <UserIcon size={32} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">{t('account_type')}</div>
                            <div className="text-lg font-semibold text-aura-teal capitalize">{user?.role || t('customer')}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Bookings Section */}
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                        {t('bookings_title')}
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-teal"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('no_bookings')}</h3>
                            <p className="text-gray-500 mb-6">{t('book_first')}</p>
                            <button
                                onClick={() => router.push("/book")}
                                className="bg-aura-teal text-white px-8 py-3 rounded-full font-medium hover:bg-teal-500 transition-all shadow-lg"
                            >
                                {t('book_now')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Upcoming Bookings */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {t('upcoming')}
                                </h3>
                                <div className="space-y-4">
                                    {bookings.filter(b => new Date(b.start_time) >= new Date()).length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">{t('no_upcoming')}</p>
                                    ) : (
                                        bookings.filter(b => new Date(b.start_time) >= new Date()).map((booking, index) => (
                                            <BookingCard key={booking.id} booking={booking} index={index} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} cancelBooking={cancelBooking} />
                                        ))
                                    )}
                                </div>
                            </section>

                            {/* Past Bookings */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                    {t('past')}
                                </h3>
                                <div className="space-y-4 opacity-75">
                                    {bookings.filter(b => new Date(b.start_time) < new Date()).length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">{t('no_past')}</p>
                                    ) : (
                                        bookings.filter(b => new Date(b.start_time) < new Date()).map((booking, index) => (
                                            <BookingCard key={booking.id} booking={booking} index={index} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} cancelBooking={cancelBooking} isPast={true} />
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
