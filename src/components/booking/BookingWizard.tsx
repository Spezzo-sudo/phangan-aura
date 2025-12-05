"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBookingStore } from "@/lib/store";
import { StepService } from "@/components/booking/StepService";
import { StepStaff } from "@/components/booking/StepStaff";
import { StepLocation } from "@/components/booking/StepLocation";
import { StepDateTime } from "@/components/booking/StepDateTime";
import { StepAddons } from "@/components/booking/StepAddons";
import { StepConfirm } from "@/components/booking/StepConfirm";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function BookingWizard() {
    const t = useTranslations('Booking');
    const searchParams = useSearchParams();
    const { step, setStep, setCategory, reset } = useBookingStore();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const categoryParam = searchParams.get("category");

        // If a category is provided in URL, it means we are starting a NEW booking flow.
        // So we reset the store to ensure we start fresh at Step 1.
        if (categoryParam) {
            reset(); // Clear previous state
            setCategory(categoryParam); // Set the new category
            setStep(1); // Force Step 1
        }

        setIsInitialized(true);
    }, [searchParams, reset, setCategory, setStep]);

    if (!isInitialized) return null;

    const renderStep = () => {
        switch (step) {
            case 1:
                return <StepService />;
            case 2:
                return <StepStaff />;
            case 3:
                return <StepLocation />;
            case 4:
                return <StepDateTime />;
            case 5:
                return <StepAddons />;
            case 6:
                return <StepConfirm />;
            default:
                return null;
        }
    };

    return (
        <div className="pt-32 container mx-auto px-4 max-w-3xl">
            {/* Progress Bar */}
            <div className="mb-12 relative">
                <div className="flex justify-between mb-4 relative z-10">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div
                                className={`
                                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-500
                                    ${step >= s ? "bg-aura-teal text-white shadow-lg shadow-aura-teal/25" : "bg-white text-gray-300 border border-gray-200"}
                                `}
                            >
                                {step > s ? <Check size={16} /> : s}
                            </div>
                            <span className={`hidden md:block text-xs font-medium transition-colors duration-300 ${step >= s ? "text-aura-teal" : "text-gray-300"}`}>
                                {s === 1 ? t('steps.service') : s === 2 ? t('steps.staff') : s === 3 ? t('steps.location') : s === 4 ? t('steps.time') : s === 5 ? t('steps.extras') : t('steps.confirm')}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Progress Line Background */}
                <div className="absolute top-[16px] md:top-[20px] left-0 w-full h-0.5 bg-gray-200 -z-0" />
                {/* Progress Line Active */}
                <motion.div
                    className="absolute top-[16px] md:top-[20px] left-0 h-0.5 bg-aura-teal -z-0 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: (step - 1) / 5 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: "100%" }}
                />
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-white/50 min-h-[400px]">
                {renderStep()}
            </div>
        </div>
    );
}
