"use client";

import { Navbar } from "@/components/Navbar";
import { useTranslations } from "next-intl";

export default function PrivacyPage() {
    const t = useTranslations('Legal.privacy');

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />
            <div className="pt-32 container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">{t('title')}</h1>
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 space-y-6 text-gray-700">
                    <p>{t('intro')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('data_collection')}</h2>
                        <p>{t('data_collection_text')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('usage')}</h2>
                        <p>{t('usage_text')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cookies')}</h2>
                        <p>{t('cookies_text')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('third_party')}</h2>
                        <p>{t('third_party_text')}</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
