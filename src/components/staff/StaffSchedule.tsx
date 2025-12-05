"use client";

import { Database } from "@/types/database";
import { StaffBookingCard } from "./StaffBookingCard";

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    services: { title: string; duration_min: number; price_thb: number } | null;
};

interface StaffScheduleProps {
    bookings: Booking[];
    onAction: (bookingId: string, action: 'confirm' | 'cancel' | 'complete' | 'cancel_confirmed') => void;
}

import { useTranslations } from "next-intl";

export function StaffSchedule({ bookings, onAction }: StaffScheduleProps) {
    const t = useTranslations('StaffDashboard.schedule');

    // Group bookings by date
    const groupedBookings = bookings.reduce((acc, booking) => {
        const date = new Date(booking.start_time);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let key = "upcoming";
        if (date.toDateString() === today.toDateString()) key = "today";
        else if (date.toDateString() === tomorrow.toDateString()) key = "tomorrow";

        if (!acc[key]) acc[key] = [];
        acc[key].push(booking);
        return acc;
    }, {} as Record<string, Booking[]>);

    const groupOrder = ["today", "tomorrow", "upcoming"];

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">{t('no_bookings')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('free_time')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900">{t('title')}</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{t('active', { count: bookings.length })}</span>
            </div>

            {groupOrder.map(group => {
                const groupBookings = groupedBookings[group];
                if (!groupBookings || groupBookings.length === 0) return null;

                return (
                    <div key={group}>
                        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${group === 'today' ? 'text-aura-teal' :
                            group === 'tomorrow' ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${group === 'today' ? 'bg-aura-teal' :
                                group === 'tomorrow' ? 'bg-blue-600' : 'bg-gray-400'
                                }`}></span>
                            {t(`groups.${group}`)}
                        </h3>
                        <div className="space-y-4">
                            {groupBookings.map((booking) => (
                                <StaffBookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onAction={onAction}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
