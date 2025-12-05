"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />
            <div className="pt-40 container mx-auto px-4 text-center">
                <h1 className="text-9xl font-serif font-bold text-aura-teal/20">404</h1>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mt-4 mb-6">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-aura-teal text-white px-8 py-3 rounded-full font-medium hover:bg-teal-600 transition-all shadow-lg hover:shadow-aura-teal/25"
                >
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
