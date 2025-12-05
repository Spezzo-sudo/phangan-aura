"use client";

import { Navbar } from "@/components/Navbar";
import { useTranslations } from "next-intl";

export default function ImprintPage() {
    const t = useTranslations('Legal.imprint');

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />
            <div className="pt-32 container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">{t('title')}</h1>
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('company_info')}</h2>
                        <p>Phangan Aura Co., Ltd.</p>
                        <p>123 Beach Road, Moo 1</p>
                        <p>Thong Sala, Koh Phangan</p>
                        <p>Surat Thani, 84280 Thailand</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('contact')}</h2>
                        <p>Email: contact@phangan-aura.com</p>
                        <p>Phone: +66 12 345 6789</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('director')}</h2>
                        <p>Mark Mustermann</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('disclaimer')}</h2>
                        <p>{t('disclaimer_text')}</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
