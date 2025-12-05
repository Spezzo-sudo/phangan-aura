"use client";

import { useState } from "react";
import { useBookingStore } from "@/lib/store";
import { Calendar as CalendarIcon, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function StepDateTime() {
    const t = useTranslations('Booking');
    const { nextStep, prevStep, setDate, setTime } = useBookingStore();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Mock time slots
    const timeSlots = [
        "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ];

    const handleNext = () => {
        if (selectedDate && selectedTime) {
            setDate(selectedDate);
            setTime(selectedTime);
            nextStep();
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900">{t('datetime_selection.title')}</h2>
                <p className="text-gray-600">{t('datetime_selection.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Simple Date Picker Placeholder */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-aura-teal font-medium">
                        <CalendarIcon size={20} />
                        <span>{t('steps.time')}</span>
                    </div>
                    <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-aura-teal/20"
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />
                </div>

                {/* Time Slots */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-aura-teal font-medium">
                        <Clock size={20} />
                        <span>{t('steps.time')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                    "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                                    selectedTime === time
                                        ? "bg-aura-teal text-white shadow-md"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-500 hover:bg-gray-100 transition-all"
                >
                    <ArrowLeft size={18} /> {t('back')}
                </button>
                <button
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedTime}
                    className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all",
                        selectedDate && selectedTime
                            ? "bg-aura-teal text-white shadow-lg hover:bg-teal-500 hover:shadow-aura-teal/25"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {t('next')} <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}
