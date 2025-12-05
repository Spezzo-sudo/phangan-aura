"use client";

import { MapPin, User, Check, AlertCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { Database } from "@/types/database";
import { useLocale } from "next-intl";

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    services: { title: any; duration_min: number; price_thb: number } | null;
};

interface StaffBookingCardProps {
    booking: Booking;
    onAction: (bookingId: string, action: 'confirm' | 'cancel' | 'complete' | 'cancel_confirmed') => void;
}

export function StaffBookingCard({ booking, onAction }: StaffBookingCardProps) {
    const locale = useLocale();

    const getServiceTitle = (service: Booking['services']) => {
        if (!service?.title) return "Unknown Service";
        if (typeof service.title === 'string') return service.title;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (service.title as any)[locale] || (service.title as any)['en'] || "Unknown Service";
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4">
            {/* Time Column */}
            <div className="md:w-32 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <div className="text-2xl font-bold text-aura-teal">
                    {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                    {new Date(booking.start_time).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className={`mt-2 text-xs px-2 py-1 rounded-full capitalize ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                    booking.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                        booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                            'bg-yellow-50 text-yellow-600'
                    }`}>
                    {booking.status === 'pending' ? 'Ausstehend' :
                        booking.status === 'confirmed' ? 'Bestätigt' :
                            booking.status === 'completed' ? 'Abgeschlossen' :
                                booking.status === 'cancelled' ? 'Storniert' : booking.status}
                </div>
            </div>

            {/* Details Column */}
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-lg">{getServiceTitle(booking.services)}</h3>
                    <span className="text-sm font-medium text-gray-500">{booking.services?.duration_min} min</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="mt-0.5 min-w-[16px] text-aura-teal"><MapPin size={16} /></div>
                    <div>
                        <div className="font-medium text-gray-800">{booking.location_address || "No address provided"}</div>
                    </div>
                </div>

                {booking.notes && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-2">
                        <div className="mt-0.5 min-w-[16px] text-aura-teal"><User size={16} /></div>
                        <div className="whitespace-pre-wrap text-xs">{booking.notes}</div>
                    </div>
                )}

                {/* Addons Display */}

                {booking.addons && Array.isArray(booking.addons) && booking.addons.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-50">
                        <span className="text-xs font-medium text-gray-500 block mb-1">Extras to bring:</span>
                        <div className="flex flex-wrap gap-2">
                            {(booking.addons as any[]).map((addon: { name: string }, i: number) => (
                                <span key={i} className="bg-aura-teal/10 text-aura-teal px-2 py-1 rounded-md text-xs font-bold border border-aura-teal/20">
                                    + {addon.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Column */}
            <div className="flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 min-w-[120px]">
                {booking.status === "pending" && (
                    <>
                        <Tooltip content="Buchung bestätigen und Kunden benachrichtigen">
                            <button
                                onClick={() => onAction(booking.id, "confirm")}
                                className="w-full bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Annehmen
                            </button>
                        </Tooltip>
                        <Tooltip content="Buchung ablehnen">
                            <button
                                onClick={() => onAction(booking.id, "cancel")}
                                className="w-full bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Ablehnen
                            </button>
                        </Tooltip>
                    </>
                )}
                {booking.status === "confirmed" && (
                    <>
                        <Tooltip content="Behandlung erfolgreich abgeschlossen">
                            <button
                                onClick={() => onAction(booking.id, "complete")}
                                className="w-full bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Fertig
                            </button>
                        </Tooltip>
                        <Tooltip content="Navigation zum Kunden öffnen">
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${booking.location_lat},${booking.location_lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center flex items-center justify-center"
                            >
                                Navi
                            </a>
                        </Tooltip>
                        <Tooltip content="Buchung nachträglich stornieren">
                            <button
                                onClick={() => onAction(booking.id, "cancel_confirmed")}
                                className="w-full bg-white border border-red-200 text-red-500 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Stornieren
                            </button>
                        </Tooltip>
                    </>
                )}
                {(booking.status === "completed" || booking.status === "cancelled") && (
                    <div className={`text-center text-xs font-bold capitalize py-2 px-3 rounded-lg ${booking.status === "completed" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                        }`}>
                        {booking.status === "completed" ? "Abgeschlossen" : "Storniert"}
                    </div>
                )}
            </div>
        </div>
    );
}
