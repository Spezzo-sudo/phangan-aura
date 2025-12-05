"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, Link } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();
    const t = useTranslations('Auth.register');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Success!
            router.push("/");
            router.refresh();
        }
    };

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />

            <div className="pt-32 container mx-auto px-4 max-w-md">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6 text-center">{t('title')}</h1>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_label')}</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-aura-teal focus:ring-2 focus:ring-aura-teal/20 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email_label')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-aura-teal focus:ring-2 focus:ring-aura-teal/20 outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password_label')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-aura-teal focus:ring-2 focus:ring-aura-teal/20 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-aura-teal text-white py-3 rounded-xl font-medium hover:bg-teal-500 transition-all shadow-lg hover:shadow-aura-teal/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('loading_btn') : t('submit_btn')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        {t('has_account')}{" "}
                        <Link href="/login" className="text-aura-teal font-medium hover:underline">
                            {t('login_link')}
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
