"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className={cn("flex items-center gap-2 text-sm font-medium", className)}>
            <button
                onClick={() => switchLocale('en')}
                className={cn("transition-colors hover:text-aura-teal", locale === 'en' ? "text-aura-teal font-bold" : "text-gray-400")}
            >
                EN
            </button>
            <span className="text-gray-300">|</span>
            <button
                onClick={() => switchLocale('de')}
                className={cn("transition-colors hover:text-aura-teal", locale === 'de' ? "text-aura-teal font-bold" : "text-gray-400")}
            >
                DE
            </button>
            <span className="text-gray-300">|</span>
            <button
                onClick={() => switchLocale('th')}
                className={cn("transition-colors hover:text-aura-teal", locale === 'th' ? "text-aura-teal font-bold" : "text-gray-400")}
            >
                TH
            </button>
        </div>
    );
}
