"use client";

import { Navbar } from "@/components/Navbar";
import { useTranslations } from "next-intl";

export default function TermsPage() {
    const t = useTranslations('Legal.terms');

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />
            <div className="pt-32 container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">{t('title')}</h1>
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 space-y-6 text-gray-700">
                    <p>{t('intro')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('bookings')}</h2>
                        <p>{t('bookings_text')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cancellations')}</h2>
                        <p>{t('cancellations_text')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('payments')}</h2>
                        <p>{t('payments_text')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('liability')}</h2>
                        <p>{t('liability_text')}</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
