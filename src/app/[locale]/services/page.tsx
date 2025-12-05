"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ArrowRight, Sparkles, Heart, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

const servicesConfig = {
    massage: {
        icon: Sun,
        color: "bg-orange-100 text-orange-600",
    },
    nails: {
        icon: Sparkles,
        color: "bg-pink-100 text-pink-600",
    },
    beauty: {
        icon: Heart,
        color: "bg-teal-100 text-teal-600",
    },
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function ServicesPage() {
    const t = useTranslations('ServicesPage');
    const serviceKeys = Object.keys(servicesConfig) as Array<keyof typeof servicesConfig>;

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />

            <div className="pt-32 container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-2xl mx-auto mb-16"
                >
                    <span className="text-aura-teal font-semibold tracking-wider uppercase text-sm mb-4 block">
                        {t('badge')}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {t('subtitle')}
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                >
                    {serviceKeys.map((key) => {
                        const config = servicesConfig[key];
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={key}
                                variants={item}
                                className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${config.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon size={28} />
                                </div>

                                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                                    {t(`items.${key}.title`)}
                                </h3>

                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {t(`items.${key}.description`)}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                                    <span className="font-medium text-aura-gold">
                                        {t(`items.${key}.price`)}
                                    </span>

                                    <Link
                                        href={`/book?category=${key}`}
                                        className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:text-aura-teal transition-colors"
                                    >
                                        {t('book_now')} <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </main>
    );
}
