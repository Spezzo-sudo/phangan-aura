"use client";

import { Navbar } from "@/components/Navbar";
import { useTranslations } from "next-intl";

// Let's build a simple Accordion inline to avoid dependency issues if the component doesn't exist yet.
import { useState } from "react";
import { ChevronDown } from "lucide-react";

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
            >
                <span className={`font-medium text-lg transition-colors ${isOpen ? 'text-aura-teal' : 'text-gray-900'}`}>
                    {question}
                </span>
                <ChevronDown
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-aura-teal' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-gray-600 leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const t = useTranslations('FAQ');

    const faqs = [
        'how_it_works',
        'areas',
        'payment',
        'cancellation',
        'preparation',
        'products'
    ];

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />
            <div className="pt-32 container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{t('title')}</h1>
                    <p className="text-gray-600">{t('subtitle')}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/50">
                    {faqs.map((key) => (
                        <FAQItem
                            key={key}
                            question={t(`questions.${key}.q`)}
                            answer={t(`questions.${key}.a`)}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
