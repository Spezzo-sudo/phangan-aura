"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutCancel() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-aura-sand">
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 md:p-12 rounded-2xl shadow-xl text-center space-y-6"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto"
                    >
                        <XCircle className="text-orange-600" size={48} />
                    </motion.div>

                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
                            Payment Cancelled
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Your order was not completed. No charges have been made.
                        </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-left">
                        <p className="text-sm text-gray-600">
                            Don't worry! Your cart items are still saved. You can continue shopping or try checking out again when you're ready.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={() => router.push('/checkout')}
                            className="flex-1 bg-aura-teal text-white py-3 px-6 rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back to Checkout
                        </button>
                        <button
                            onClick={() => router.push('/shop')}
                            className="flex-1 border border-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
