"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useCartStore } from "@/lib/cartStore";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CreditCard, Info } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, setItems } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [user, setUser] = useState<{ email: string, full_name: string | null } | null>(null);
    const t = useTranslations('Checkout');

    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    });

    useEffect(() => {
        // Redirect if cart is empty
        if (items.length === 0) {
            router.push("/shop");
            return;
        }

        // Fetch user data
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: profile } = await (supabase as any)
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profile) {
                    setUser(profile);
                    setCustomerInfo({
                        name: profile.full_name || "",
                        email: profile.email || authUser.email || "",
                        phone: "",
                        address: ""
                    });
                }
            }
        };

        fetchData();
    }, [items, router]);

    const handleCheckout = async () => {
        if (!customerInfo.name || !customerInfo.email) {
            alert(t('alert_fill_info'));
            return;
        }

        setLoading(true);
        setStatusMessage(t('status_validating'));

        try {
            const validationResponse = await fetch('/api/cart/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });

            const validationData = await validationResponse.json();

            if (!validationResponse.ok) {
                const message = validationData?.error || t('alert_fail');
                alert(message);
                setLoading(false);
                if (validationData?.items) {
                    setItems(validationData.items.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price_thb,
                        quantity: item.quantity,
                        maxQuantity: item.maxQuantity,
                    })));
                }
                return;
            }

            const sanitizedItems = validationData.items.map((item: any) => ({
                id: item.id,
                name: item.name,
                price_thb: item.price_thb,
                quantity: item.quantity,
            }));

            // keep cart in sync with validated values for UI feedback
            setItems(validationData.items.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price_thb,
                quantity: item.quantity,
                maxQuantity: item.maxQuantity,
            })));

            if (validationData?.messages?.length) {
                alert(validationData.messages.join('\n'));
            }

            setStatusMessage(t('status_creating_session'));
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: sanitizedItems,
                    customerInfo,
                    paymentMethod: 'card'  // Force card payment in shop
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Checkout failed');
            }

            // Redirect to Stripe Checkout using the URL
            if (data.url) {
                setStatusMessage(t('status_redirecting'));
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            alert(t('alert_fail'));
            setLoading(false);
            setStatusMessage(null);
        }
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <main className="min-h-screen bg-aura-sand">
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
                <button
                    onClick={() => router.push('/shop')}
                    className="flex items-center gap-2 text-gray-600 hover:text-aura-teal transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    {t('back_to_shop')}
                </button>

                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{t('title')}</h1>

                {/* Info Banner: Cash only with Booking */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-8 flex items-start gap-3">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-900">
                        <p className="font-bold mb-1">{t('free_delivery_title')}</p>
                        <p dangerouslySetInnerHTML={{ __html: t.raw('free_delivery_text') }}></p>
                        <button
                            onClick={() => router.push('/book')}
                            className="mt-2 text-blue-600 underline font-medium hover:text-blue-800"
                        >
                            {t('book_massage_btn')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Customer Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">{t('contact_info')}</h2>

                            {statusMessage && (
                                <div className="mb-4 rounded-lg bg-aura-teal/10 text-aura-teal px-4 py-3 text-sm font-medium" aria-live="polite">
                                    {statusMessage}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('name_label')}
                                    </label>
                                    <input
                                        type="text"
                                        value={customerInfo.name}
                                        onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-aura-teal focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('email_label')}
                                    </label>
                                    <input
                                        type="email"
                                        value={customerInfo.email}
                                        onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-aura-teal focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('phone_label')}
                                    </label>
                                    <input
                                        type="tel"
                                        value={customerInfo.phone}
                                        onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-aura-teal focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('address_label')}
                                    </label>
                                    <textarea
                                        value={customerInfo.address}
                                        onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-aura-teal focus:border-transparent"
                                        rows={3}
                                        placeholder={t('address_placeholder')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">{t('order_summary')}</h2>

                            <div className="space-y-3 mb-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.quantity}× {item.name}
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {(item.price * item.quantity).toLocaleString()} ฿
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>{t('total')}</span>
                                    <span className="text-aura-teal">{totalPrice().toLocaleString()} ฿</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {t('secure_checkout')}
                                </p>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading || !customerInfo.name || !customerInfo.email}
                                className="w-full bg-aura-teal text-white py-4 rounded-lg font-bold text-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        {t('pay_btn', { amount: totalPrice().toLocaleString() })}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                {t('free_delivery_note')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
