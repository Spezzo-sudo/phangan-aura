"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default function BookingPage() {
    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20 relative">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2000&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(2px)'
                }}
            />
            <div className="relative z-10">
                <Navbar />
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-teal"></div>
                    </div>
                }>
                    <BookingWizard />
                </Suspense>
            </div>
        </main>
    );
}
