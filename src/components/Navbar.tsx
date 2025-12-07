"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { useCartStore } from "@/lib/cartStore";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Profile = Database['public']['Tables']['profiles']['Row'];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<Profile | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const { totalItems, toggleCart } = useCartStore();
    const supabase = createClient();
    const router = useRouter();
    const t = useTranslations('Navbar');

    const checkUser = useCallback(async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", authUser.id)
                .single();
            setUser(profile);
        } else {
            setUser(null);
        }
    }, [supabase]);

    useEffect(() => {
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkUser();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [checkUser, supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setShowDropdown(false);
        router.push("/");
        router.refresh();
    };

    const getDashboardLink = () => {
        if (!user) return "/";
        if (user.role === "admin") return "/admin";
        if (user.role === "staff") return "/staff";
        return "/profile";
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl"
            >
                <div className="px-6 py-3 flex items-center justify-between rounded-full border border-white/40 shadow-xl bg-white/70 backdrop-blur-xl">
                    <Link href="/" className="text-2xl font-serif font-bold text-aura-teal tracking-tight hover:opacity-80 transition-opacity" onClick={() => setIsOpen(false)}>
                        Phangan Aura
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/services" className="text-gray-600 hover:text-aura-teal transition-colors">
                            {t('services')}
                        </Link>
                        <Link href="/shop" className="text-gray-600 hover:text-aura-teal transition-colors">
                            {t('shop')}
                        </Link>
                        <Link href="/about" className="text-gray-600 hover:text-aura-teal transition-colors">
                            {t('about')}
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Language Switcher (Desktop) */}
                        <div className="hidden md:block mr-2">
                            <LanguageSwitcher />
                        </div>

                        {/* Cart Button (Desktop) */}
                        <button
                            onClick={toggleCart}
                            className="hidden md:flex relative items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-aura-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-teal focus-visible:ring-offset-2"
                            aria-label="Shopping cart"
                            aria-expanded={false}
                        >
                            <ShoppingCart size={20} />
                            {totalItems() > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-aura-teal text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border border-white shadow-md">
                                    {totalItems()}
                                </span>
                            )}
                        </button>

                        {/* User Menu (Desktop) */}
                        {user ? (
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-aura-teal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-teal focus-visible:ring-offset-2"
                                    aria-expanded={showDropdown}
                                    aria-controls="navbar-user-menu"
                                >
                                    <div className="w-8 h-8 rounded-full bg-aura-teal/10 flex items-center justify-center text-aura-teal border border-aura-teal/20">
                                        {user.avatar_url ? (
                                            <Image src={user.avatar_url} alt="Avatar" width={32} height={32} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User size={16} />
                                        )}
                                    </div>
                                    <span className="max-w-[100px] truncate">{user.full_name?.split(' ')[0]}</span>
                                </button>

                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1"
                                            id="navbar-user-menu"
                                        >
                                            <Link
                                                href={getDashboardLink()}
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <LayoutDashboard size={16} />
                                                {user.role === 'customer' ? t('my_bookings') : t('dashboard')}
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                            >
                                                <LogOut size={16} />
                                                {t('sign_out')}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className="hidden md:block text-sm font-medium text-gray-600 hover:text-aura-teal transition-colors">
                                {t('sign_in')}
                            </Link>
                        )}

                        <Link href="/book" className="hidden md:block">
                            <button
                                onClick={() => {
                                    // Reset store to ensure fresh start
                                    import("@/lib/store").then(mod => mod.useBookingStore.getState().reset());
                                }}
                                className="bg-aura-teal text-white px-6 py-2 rounded-full font-medium hover:bg-teal-500 transition-all hover:shadow-lg active:scale-95"
                            >
                                {t('book_now')}
                            </button>
                        </Link>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden text-gray-600 hover:text-aura-teal transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-teal focus-visible:ring-offset-2"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={isOpen}
                            aria-controls="mobile-navigation"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-aura-sand/95 backdrop-blur-xl pt-32 px-6 md:hidden flex flex-col"
                        id="mobile-navigation"
                    >
                        <div className="flex flex-col gap-6 text-center items-center">
                            <Link
                                href="/services"
                                onClick={() => setIsOpen(false)}
                                className="text-2xl font-serif font-medium text-gray-800 hover:text-aura-teal transition-colors"
                            >
                                {t('services')}
                            </Link>
                            <Link
                                href="/shop"
                                onClick={() => setIsOpen(false)}
                                className="text-2xl font-serif font-medium text-gray-800 hover:text-aura-teal transition-colors"
                            >
                                {t('shop')}
                            </Link>
                            <Link
                                href="/about"
                                onClick={() => setIsOpen(false)}
                                className="text-2xl font-serif font-medium text-gray-800 hover:text-aura-teal transition-colors"
                            >
                                {t('about')}
                            </Link>

                            <div className="w-16 h-1 bg-aura-teal/20 rounded-full my-2" />

                            {/* Language Switcher (Mobile) */}
                            <LanguageSwitcher className="text-lg gap-4" />

                            <div className="w-16 h-1 bg-aura-teal/20 rounded-full my-2" />

                            {/* Cart Button (Mobile) */}
                            <button
                                onClick={() => { setIsOpen(false); toggleCart(); }}
                                className="relative flex items-center gap-2 text-xl font-medium text-gray-800 hover:text-aura-teal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-teal focus-visible:ring-offset-2"
                                aria-label="Open cart"
                                aria-expanded={false}
                            >
                                <ShoppingCart size={20} />
                                <span>{t('cart')}</span>
                                {totalItems() > 0 && (
                                    <span className="bg-aura-teal text-white text-xs font-bold rounded-full px-2.5 py-1 border border-white shadow">
                                        {totalItems()}
                                    </span>
                                )}
                            </button>

                            <div className="w-16 h-1 bg-aura-teal/20 rounded-full my-2" />

                            {user ? (
                                <>
                                    <Link
                                        href={getDashboardLink()}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2 text-xl font-medium text-gray-800"
                                    >
                                        <LayoutDashboard size={20} />
                                        {user.role === 'customer' ? t('my_bookings') : t('dashboard')}
                                    </Link>
                                    <button
                                        onClick={() => { handleSignOut(); setIsOpen(false); }}
                                        className="flex items-center gap-2 text-xl font-medium text-red-600"
                                    >
                                        <LogOut size={20} />
                                        {t('sign_out')}
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-medium text-gray-600"
                                >
                                    {t('sign_in')}
                                </Link>
                            )}

                            <Link
                                href="/book"
                                onClick={() => {
                                    setIsOpen(false);
                                    import("@/lib/store").then(mod => mod.useBookingStore.getState().reset());
                                }}
                                className="w-full max-w-xs mt-4"
                            >
                                <button className="w-full bg-aura-teal text-white px-8 py-4 rounded-full text-xl font-medium shadow-lg hover:bg-teal-500 transition-all">
                                    {t('book_now')}
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
