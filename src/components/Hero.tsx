"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Hero() {
    const t = useTranslations('Hero');
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-aura-sand via-white to-aura-sand/50 -z-20" />

            {/* Decorative Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-aura-teal/20 rounded-full blur-[120px] -z-10"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-aura-coral/15 rounded-full blur-[120px] -z-10"
            />

            <div className="container mx-auto px-4 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-aura-gold/10 text-aura-gold text-sm font-semibold mb-6 tracking-wide uppercase">
                        {t('badge')}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-gray-900 mb-8 leading-tight"
                >
                    {t.rich('title', {
                        br: () => <br />,
                        span: (chunks) => (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-teal to-teal-600">
                                {chunks}
                            </span>
                        )
                    })}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    {t('subtitle')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link href="/book" className="w-full sm:w-auto">
                        <button className="w-full bg-aura-teal text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-teal-500 transition-all shadow-lg hover:shadow-aura-teal/25 hover:-translate-y-1">
                            {t('cta_book')}
                        </button>
                    </Link>
                    <Link href="/services" className="w-full sm:w-auto">
                        <button className="w-full bg-white text-gray-800 px-8 py-4 rounded-full text-lg font-medium border border-gray-200 hover:border-aura-teal hover:text-aura-teal transition-all shadow-sm hover:shadow-md">
                            {t('cta_explore')}
                        </button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-16 relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="aspect-[16/9] relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/hero.png"
                            alt="Luxury Spa Villa"
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
