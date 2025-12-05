"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User as UserIcon } from "lucide-react";
import { Database } from "@/types/database";
import { useLocale } from "next-intl";

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    services: { title: any; duration_min: number; price_thb: number } | null;
    staff: { full_name: string; avatar_url: string | null } | null;
};

interface BookingCardProps {
    booking: Booking;
    index: number;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
    cancelBooking: (id: string) => void;
    isPast?: boolean;
}

export function BookingCard({ booking, index, getStatusColor, getStatusIcon, cancelBooking, isPast = false }: BookingCardProps) {
    const locale = useLocale();

    const getServiceTitle = (service: Booking['services']) => {
        if (!service?.title) return "Service";
        if (typeof service.title === 'string') return service.title;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (service.title as any)[locale] || (service.title as any)['en'] || "Service";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${isPast ? 'grayscale-[0.5]' : ''}`}
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {getServiceTitle(booking.services)}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <UserIcon size={14} />
                            <span>with {booking.staff?.full_name || "Staff Member"}</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(booking.status || "pending")}`}>
                        {getStatusIcon(booking.status || "pending")}
                        <span className="text-sm font-medium capitalize">{booking.status || "pending"}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-aura-teal" />
                        <span className="text-sm">
                            {new Date(booking.start_time).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric"
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} className="text-aura-teal" />
                        <span className="text-sm">
                            {new Date(booking.start_time).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} className="text-aura-teal" />
                        <span className="text-sm truncate">
                            {booking.location_address || "Location TBD"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <div className="text-lg font-bold text-aura-gold">

                            {booking.total_price
                                ? booking.total_price
                                : (booking.services?.price_thb || 0) +
                                ((booking.addons as any[])?.reduce((sum: number, addon: any) => sum + (addon.price || 0), 0) || 0)
                            } THB
                        </div>
                        {/* Addons Display */}

                        {booking.addons && Array.isArray(booking.addons) && booking.addons.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {(booking.addons as any[]).map((addon: { name: string }, i: number) => (
                                    <span key={i} className="bg-aura-teal/10 text-aura-teal px-2 py-0.5 rounded-full text-xs font-medium">
                                        + {addon.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isPast && (booking.status === "pending" || booking.status === "confirmed") && (
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to cancel this booking?")) {
                                    cancelBooking(booking.id);
                                }
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
