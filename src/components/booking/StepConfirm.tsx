"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/lib/store";
import { ArrowLeft, Check, ShoppingBag, Phone, Mail, User, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedContent } from "@/lib/i18n-utils";

export function StepConfirm() {
    const t = useTranslations('Booking');
    const locale = useLocale();
    const { prevStep, service, staff, date, time, address, lat, lng, locationNotes, reset, addons } = useBookingStore();
    const [contact, setContact] = useState({ name: "", email: "", phone: "" });
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState<{ enable_stripe: boolean; enable_cash: boolean }>({ enable_stripe: false, enable_cash: true });
    const router = useRouter();

    // Fetch payment settings
    useEffect(() => {
        const fetchSettings = async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase as any)
                .from('company_settings')
                .select('setting_value')
                .eq('setting_key', 'payment_config')
                .single();

            if (data?.setting_value) {
                setSettings(data.setting_value);
                // If cash is disabled, default to card (if enabled)
                if (!data.setting_value.enable_cash && data.setting_value.enable_stripe) {
                    setPaymentMethod('card');
                }
            }
        };
        fetchSettings();
    }, []);

    // Auto-fill user data if logged in
    useEffect(() => {
        const fetchUser = async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: profile } = await (supabase as any)
                    .from('profiles')
                    .select('full_name, email, phone')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setContact({
                        name: profile.full_name || "",
                        email: user.email || "",
                        phone: profile.phone || ""
                    });
                }
            }
        };
        fetchUser();
    }, []);

    const handleConfirm = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: service?.id,
                    staff_id: staff?.id,
                    date: date?.toISOString().split('T')[0],
                    time,
                    address,
                    lat,
                    lng,
                    location_notes: locationNotes,
                    contact,
                    addons,
                    payment_method: paymentMethod
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Booking failed");
            }

            if (result.url) {
                window.location.href = result.url;
                return;
            }

            setSuccess(true);

            setTimeout(() => {
                reset();
                router.push("/profile");
            }, 3000);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            alert("Error: " + errorMessage);
            setIsSubmitting(false);
        }
    };

    const isValid = contact.name && contact.email && contact.phone;
    const addonsTotal = addons.reduce((sum, item) => sum + (item.price_thb * item.quantity), 0);
    const totalPrice = (service?.price_thb || 0) + addonsTotal;

    if (success) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={48} />
                </div>

                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                        Booking Confirmed!
                    </h2>
                    <p className="text-gray-600">
                        {paymentMethod === 'cash'
                            ? 'Please pay the therapist in cash upon arrival.'
                            : 'Payment processed successfully.'}
                    </p>
                </div>

                <p className="text-sm text-gray-500">
                    Redirecting to your bookings...
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900">{t('confirmation.title')}</h2>
                <p className="text-gray-600">{t('confirmation.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Summary Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-lg text-gray-900 border-b pb-2">Booking Summary</h3>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">{t('confirmation.service')}</span>
                            <span className="font-medium text-gray-900">{getLocalizedContent(service?.title || null, locale)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">{t('confirmation.specialist')}</span>
                            <span className="font-medium text-gray-900">{staff?.full_name || t('staff_selection.no_staff')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">{t('confirmation.date_time')}</span>
                            <span className="font-medium text-gray-900">
                                {date?.toLocaleDateString()} at {time}
                            </span>
                        </div>

                        {/* Addons List */}
                        {addons.length > 0 && (
                            <div className="pt-2 border-t">
                                <span className="text-gray-500 block mb-2">{t('addons_selection.title')}:</span>
                                {addons.map((addon) => (
                                    <div key={addon.id} className="flex justify-between items-center mb-1 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Check size={12} className="text-aura-teal" />
                                            <span>{addon.quantity}× {getLocalizedContent(addon.name, locale)}</span>
                                        </div>
                                        <span>{t('price_thb', { price: addon.price_thb * addon.quantity })}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-2 border-t flex justify-between items-center">
                            <span className="font-bold text-gray-900">{t('confirmation.total_price')}</span>
                            <span className="font-bold text-xl text-aura-gold">
                                {t('price_thb', { price: totalPrice })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact & Payment */}
                <div className="space-y-6">
                    {/* Contact Form */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-serif font-bold text-lg text-gray-900">{t('confirmation.contact_details')}</h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={t('confirmation.name')}
                                    className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-aura-teal/20"
                                    value={contact.name}
                                    onChange={e => setContact({ ...contact, name: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    placeholder={t('confirmation.email')}
                                    className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-aura-teal/20"
                                    value={contact.email}
                                    onChange={e => setContact({ ...contact, email: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    placeholder={t('confirmation.phone')}
                                    className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-aura-teal/20"
                                    value={contact.phone}
                                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-serif font-bold text-lg text-gray-900">{t('confirmation.payment_method')}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {settings.enable_cash && (
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'cash'
                                        ? 'border-aura-teal bg-aura-teal/5 text-aura-teal'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <span className="text-2xl">💵</span>
                                    <span className="font-bold text-sm">{t('confirmation.payment_cash')}</span>
                                </button>
                            )}

                            {settings.enable_stripe ? (
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'card'
                                        ? 'border-aura-teal bg-aura-teal/5 text-aura-teal'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <span className="text-2xl">💳</span>
                                    <span className="font-bold text-sm">{t('confirmation.payment_card')}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => alert("Credit Card payment is currently disabled.")}
                                    className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed flex flex-col items-center gap-2 opacity-50"
                                >
                                    <span className="text-2xl">💳</span>
                                    <span className="font-bold text-sm">Card (Disabled)</span>
                                </button>
                            )}
                        </div>
                        {paymentMethod === 'cash' && (
                            <p className="text-xs text-gray-500 text-center bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                You will pay the full amount in cash to the therapist upon arrival.
                            </p>
                        )}
                        {paymentMethod === 'card' && (
                            <p className="text-xs text-gray-500 text-center bg-blue-50 p-2 rounded-lg border border-blue-100">
                                You will be redirected to Stripe for secure payment.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                    <ArrowLeft size={18} /> {t('back')}
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={!isValid || isSubmitting}
                    className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all text-lg shadow-xl",
                        isValid && !isSubmitting
                            ? "bg-gradient-to-r from-aura-teal to-teal-600 text-white hover:shadow-aura-teal/40 hover:scale-[1.02]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                        </>
                    ) : (
                        t('confirmation.confirm_btn')
                    )}
                </button>
            </div>
        </div>
    );
}
