"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Hero() {
    const t = useTranslations('Hero');
    const shouldReduceMotion = useReducedMotion();
    const [isDesktop, setIsDesktop] = useState(false);
    const showAnimatedDecor = !shouldReduceMotion;

    useEffect(() => {
        const media = window.matchMedia("(min-width: 1024px)");
        const update = () => setIsDesktop(media.matches);

        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    const enableMotion = showAnimatedDecor && isDesktop;

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 bg-white">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-aura-sand via-white to-aura-sand/50 -z-20" />
            <div className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.08),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(251,113,133,0.08),transparent_50%)] -z-20" />

            {/* Decorative Blobs (muted on mobile/reduced motion) */}
            <motion.div
                animate={enableMotion ? {
                    scale: [1, 1.12, 1],
                    opacity: [0.25, 0.45, 0.25]
                } : undefined}
                transition={enableMotion ? {
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : undefined}
                className="motion-soft hidden md:block absolute top-[-12%] left-[-8%] w-[420px] h-[420px] bg-aura-teal/14 rounded-full blur-[100px] -z-10"
            />
            <motion.div
                animate={enableMotion ? {
                    scale: [1, 1.08, 1],
                    opacity: [0.18, 0.36, 0.18]
                } : undefined}
                transition={enableMotion ? {
                    duration: 14,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.2
                } : undefined}
                className="motion-soft hidden md:block absolute bottom-[-12%] right-[-8%] w-[420px] h-[420px] bg-aura-coral/12 rounded-full blur-[100px] -z-10"
            />

            <div className="container mx-auto px-4 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-aura-gold/10 text-aura-gold text-sm font-semibold mb-6 tracking-wide uppercase">
                        {t('badge')}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: shouldReduceMotion ? 0 : 0 }}
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
                    animate={{ opacity: 1, y: shouldReduceMotion ? 0 : 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    {t('subtitle')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: shouldReduceMotion ? 0 : 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link href="/book" className="w-full sm:w-auto">
                        <button className="w-full bg-aura-teal text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-teal-500 transition-all shadow-lg hover:shadow-aura-teal/25 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-teal focus-visible:ring-offset-2">
                            {t('cta_book')}
                        </button>
                    </Link>
                    <Link href="/services" className="w-full sm:w-auto">
                        <button className="w-full bg-white text-gray-800 px-8 py-4 rounded-full text-lg font-medium border border-gray-200 hover:border-aura-teal hover:text-aura-teal transition-all shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-teal focus-visible:ring-offset-2">
                            {t('cta_explore')}
                        </button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: shouldReduceMotion ? 1 : 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-16 relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-white/60"
                >
                    <div className="aspect-[16/9] relative">
                        <Image
                            src="/images/hero.png"
                            alt="Luxury Spa Villa"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
