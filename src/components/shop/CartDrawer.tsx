"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useRouter } from "next/navigation";

export function CartDrawer() {
    const { items, isOpen, toggleCart, removeItem, updateQuantity, totalPrice } = useCartStore();
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-aura-sand/30">
                            <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="text-aura-teal" />
                                Your Cart
                            </h2>
                            <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                        <ShoppingBag size={40} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 text-lg">Your cart is empty.</p>
                                    <button
                                        onClick={() => { toggleCart(); router.push('/shop'); }}
                                        className="text-aura-teal font-bold hover:underline"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                {item.image && (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                <p className="text-aura-teal font-medium">{item.price} THB</p>

                                                <div className="flex items-center gap-3 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="ml-auto text-xs text-red-400 hover:text-red-600 underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* UPSELL BANNER */}
                                    <div className="bg-aura-teal/5 p-4 rounded-xl border border-aura-teal/20 mt-8">
                                        <div className="flex items-start gap-3">
                                            <div className="text-aura-teal shrink-0 mt-1">✨</div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">Combine & Save</h4>
                                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                    Book a relaxing massage, and we'll bring these products to you personally—<strong>free of delivery charge</strong>!
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        toggleCart();
                                                        router.push('/book');
                                                    }}
                                                    className="text-xs font-bold text-aura-teal mt-2 hover:underline flex items-center gap-1"
                                                >
                                                    Book a Service instead <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Total</span>
                                    <span className="text-2xl font-bold text-aura-teal">{totalPrice()} THB</span>
                                </div>

                                <button
                                    onClick={() => { toggleCart(); router.push('/checkout'); }}
                                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-aura-teal transition-colors flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
