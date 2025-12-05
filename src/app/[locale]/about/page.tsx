"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function AboutPage() {
    const t = useTranslations('About');

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />

            <div className="pt-32 container mx-auto px-4 max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif font-bold text-gray-900"
                    >
                        {t('hero_title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        {t('hero_subtitle')}
                    </motion.p>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-serif font-bold text-aura-teal">{t('philosophy_title')}</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {t('philosophy_text_1')}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            {t('philosophy_text_2')}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
                            alt="Spa Atmosphere"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </motion.div>
                </div>

                {/* Legal / Impressum (Subtle) */}
                <div className="border-t border-gray-200 pt-12 mt-12 text-center md:text-left">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t('legal_notice')}</h3>
                    <div className="text-xs text-gray-400 space-y-1 font-mono">
                        <p>Phangan Aura Services Co., Ltd.</p>
                        <p>123 Srithanu, Koh Phangan</p>
                        <p>Surat Thani, 84280 Thailand</p>
                        <p>Contact: hello@phangan-aura.com</p>
                        <p className="mt-4">© {new Date().getFullYear()} Phangan Aura. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
