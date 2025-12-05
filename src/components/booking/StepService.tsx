"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useBookingStore } from "@/lib/store";
import { Sun, Sparkles, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedContent } from "@/lib/i18n-utils";

type Service = Database['public']['Tables']['services']['Row'];

const categories = [
    {
        id: "massage",
        title: "Massage",
        icon: Sun,
        color: "bg-orange-100 text-orange-600",
    },
    {
        id: "nails",
        title: "Nails",
        icon: Sparkles,
        color: "bg-pink-100 text-pink-600",
    },
    {
        id: "beauty",
        title: "Beauty",
        icon: Heart,
        color: "bg-teal-100 text-teal-600",
    },
];

export function StepService() {
    const t = useTranslations('Booking');
    const locale = useLocale();
    const { category, service, setCategory, setService, nextStep } = useBookingStore();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const searchParams = useSearchParams();

    const fetchServices = useCallback(async (selectedCategory: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("services")
            .select("*")
            .eq("category", selectedCategory as "massage" | "nails" | "beauty")
            .eq("is_active", true);

        if (error) {
            console.error("Error fetching services:", error, (error as any)?.message, (error as any)?.details);
        } else {
            setServices(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const categoryParam = searchParams.get("category");
        if (categoryParam && !category) {
            setCategory(categoryParam);
        }
    }, [searchParams, category, setCategory]);

    useEffect(() => {
        if (category) {
            fetchServices(category);
        }
    }, [category, fetchServices]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900">{t('select_service')}</h2>
                <p className="text-gray-600">{t('choose_treatment')}</p>
            </div>

            {/* Category Selection */}
            <div className="grid grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setCategory(cat.id);
                            setService(null);
                        }}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200",
                            category === cat.id
                                ? "border-aura-teal bg-aura-teal/5 ring-2 ring-aura-teal/20"
                                : "border-gray-200 bg-white hover:border-aura-teal/50 hover:bg-gray-50"
                        )}
                    >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", cat.color)}>
                            <cat.icon size={20} />
                        </div>
                        <span className="font-medium text-sm text-gray-900">{t(`categories.${cat.id}`)}</span>
                    </button>
                ))}
            </div>

            {/* Service List */}
            {category && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                >
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {t('available_treatments')}
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aura-teal"></div>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{t('no_services')}</div>
                    ) : (
                        <div className="grid gap-3">
                            {services.map((svc) => (
                                <button
                                    key={svc.id}
                                    onClick={() => setService(svc)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                                        service?.id === svc.id
                                            ? "border-aura-teal bg-aura-teal/5 ring-1 ring-aura-teal"
                                            : "border-gray-100 bg-white hover:border-aura-teal/30"
                                    )}
                                >
                                    <div>
                                        <div className="font-medium text-gray-900">{getLocalizedContent(svc.title, locale)}</div>
                                        <div className="text-sm text-gray-500">{t('duration_min', { min: svc.duration_min })}</div>
                                    </div>
                                    <div className="font-semibold text-aura-gold">{t('price_thb', { price: svc.price_thb })}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Next Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={nextStep}
                    disabled={!service}
                    className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all",
                        service
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
