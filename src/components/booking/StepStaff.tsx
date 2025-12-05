"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Star, Calendar } from "lucide-react";
import { useBookingStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedContent } from "@/lib/i18n-utils";

type StaffProfile = Database['public']['Views']['public_profiles_view']['Row'];

export function StepStaff() {
    const t = useTranslations('Booking');
    const locale = useLocale();
    const { service, setStaff, staff: selectedStaff, setStep } = useBookingStore();
    const [staffMembers, setStaffMembers] = useState<StaffProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchStaffForService = useCallback(async (serviceId: string) => {
        setLoading(true);
        // 1. Get staff IDs that offer this service
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: staffServices, error: staffError } = await (supabase as any)
            .from("staff_services")
            .select("staff_id")
            .eq("service_id", serviceId);

        if (staffError) {
            console.error("Error fetching staff services:", staffError);
            setLoading(false);
            return;
        }

        if (!staffServices || staffServices.length === 0) {
            setStaffMembers([]);
            setLoading(false);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const staffIds = staffServices.map((ss: any) => ss.staff_id);

        // 2. Get profile details for these staff IDs
        const { data: profiles, error: profilesError } = await supabase
            .from("public_profiles_view")
            .select("*")
            .in("id", staffIds);

        if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
        } else {
            setStaffMembers(profiles || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        if (service) {
            fetchStaffForService(service.id);
        }
    }, [service, fetchStaffForService]);

    const handleSelect = (staff: StaffProfile) => {
        setStaff(staff);
    };

    const handleNext = () => {
        if (selectedStaff) {
            setStep(3);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif font-bold text-gray-900">{t('staff_selection.title')}</h2>
                <p className="text-gray-600">{t('staff_selection.subtitle', { service: getLocalizedContent(service?.title || null, locale) })}</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-teal"></div>
                </div>
            ) : staffMembers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                    <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">{t('staff_selection.no_staff')}</h3>
                    <p className="text-gray-500">{t('staff_selection.no_staff_sub')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffMembers.map((staff) => (
                        <motion.div
                            key={staff.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(staff)}
                            className={`
                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4
                ${selectedStaff?.id === staff.id
                                    ? "border-aura-teal bg-aura-teal/5 shadow-lg shadow-aura-teal/10"
                                    : "border-transparent bg-white hover:border-aura-teal/30 shadow-sm hover:shadow-md"
                                }
              `}
                        >
                            {/* Avatar / Placeholder */}
                            <div className={`
                w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0
                ${selectedStaff?.id === staff.id ? "bg-aura-teal text-white" : "bg-aura-sand text-aura-teal"}
              `}>
                                {staff.avatar_url ? (
                                    <Image
                                        src={staff.avatar_url}
                                        alt={staff.full_name || ""}
                                        width={64}
                                        height={64}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    (staff.full_name?.[0] || "S").toUpperCase()
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-serif font-bold text-lg text-gray-900">{staff.full_name}</h3>
                                        <p className="text-sm text-aura-teal font-medium">{t('staff_selection.role')}</p>
                                    </div>
                                    {/* Mock Rating */}
                                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                                        <Star size={14} fill="currentColor" />
                                        <span>4.9</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                    {staff.bio || t('staff_selection.default_bio')}
                                </p>

                                {/* Mock Availability Tags */}
                                <div className="flex gap-2 mt-4">
                                    <div className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                        <Calendar size={12} />
                                        {t('staff_selection.available_today')}
                                    </div>
                                </div>
                            </div>

                            {selectedStaff?.id === staff.id && (
                                <motion.div
                                    layoutId="selected-check"
                                    className="absolute top-4 right-4 text-aura-teal"
                                >
                                    <div className="w-6 h-6 bg-aura-teal text-white rounded-full flex items-center justify-center">
                                        ✓
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="flex justify-between pt-8 border-t border-gray-100">
                <button
                    onClick={handleBack}
                    className="px-8 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    {t('back')}
                </button>
                <button
                    onClick={handleNext}
                    disabled={!selectedStaff}
                    className={`
            px-8 py-3 rounded-xl font-medium transition-all shadow-lg
            ${selectedStaff
                            ? "bg-aura-teal text-white hover:bg-teal-500 hover:shadow-aura-teal/25 transform hover:-translate-y-0.5"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }
          `}
                >
                    {t('next')}
                </button>
            </div>
        </div>
    );
}
