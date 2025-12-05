"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [isCash, setIsCash] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (orderId) {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data } = await (supabase as any)
                    .from('orders')
                    .select('order_number, payment_method')
                    .eq('id', orderId)
                    .single();

                if (data) {
                    setOrderNumber(data.order_number);
                    if (data.payment_method === 'cash') setIsCash(true);
                }
            } else if (sessionId) {
                // For Stripe, we might want to verify, but for now just show success
                // In a real app, you'd fetch the order by session_id
                setOrderNumber(`ORD-${Date.now().toString().slice(-6)}`);
            }
        };
        fetchOrder();
    }, [sessionId, orderId]);

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
                        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                    >
                        <CheckCircle2 className="text-green-600" size={48} />
                    </motion.div>

                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
                            {isCash ? 'Order Placed!' : 'Payment Successful!'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {isCash
                                ? "Thank you for your order. Please have the exact amount ready upon delivery."
                                : "Thank you for your order. We'll prepare your products for delivery."}
                        </p>
                    </div>

                    {orderNumber && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Order Number</p>
                            <p className="text-xl font-bold text-gray-900 font-mono">{orderNumber}</p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-left">
                        <div className="flex items-start gap-3">
                            <Package className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">What happens next?</p>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• You'll receive a confirmation email shortly</li>
                                    <li>• We'll prepare your order for delivery</li>
                                    <li>• Free delivery on Koh Phangan within 24-48 hours</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={() => router.push('/profile')}
                            className="flex-1 bg-aura-teal text-white py-3 px-6 rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                        >
                            View Orders
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => router.push('/shop')}
                            className="flex-1 border border-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
