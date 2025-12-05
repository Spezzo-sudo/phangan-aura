"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations('Legal');
    const tNav = useTranslations('Navbar');

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-serif font-bold text-aura-teal">
                            Phangan Aura
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Premium mobile wellness services delivered to your villa or hotel on Koh Phangan.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">{tNav('home')}</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/services" className="hover:text-aura-teal transition-colors">{tNav('services')}</Link></li>
                            <li><Link href="/shop" className="hover:text-aura-teal transition-colors">{tNav('shop')}</Link></li>
                            <li><Link href="/about" className="hover:text-aura-teal transition-colors">{tNav('about')}</Link></li>
                            <li><Link href="/book" className="hover:text-aura-teal transition-colors">{tNav('book_now')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/legal/imprint" className="hover:text-aura-teal transition-colors">{t('imprint.title')}</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-aura-teal transition-colors">{t('privacy.title')}</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-aura-teal transition-colors">{t('terms.title')}</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/faq" className="hover:text-aura-teal transition-colors">FAQ</Link></li>
                            <li><a href="mailto:contact@phangan-aura.com" className="hover:text-aura-teal transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Phangan Aura Co., Ltd. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
