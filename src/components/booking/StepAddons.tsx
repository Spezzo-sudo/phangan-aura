"use client";

import { useState, useEffect } from "react";
import { useBookingStore, Product } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Plus, Minus, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedContent } from "@/lib/i18n-utils";

// Fallback data in case DB is empty (matching the SQL seed)
const FALLBACK_PRODUCTS: Product[] = [
    {
        id: "p1",
        name: "Organic Coconut Oil",
        description: "Pure organic coconut oil for skin and hair.",
        price_thb: 350,
        category: "Body Care",
        image_url: "/images/products/coconut-oil.webp"
    },
    {
        id: "p2",
        name: "Aloe Vera Gel",
        description: "Soothing gel for after-sun care.",
        price_thb: 250,
        category: "After Sun",
        image_url: "/images/products/aloe-vera.webp"
    },
    {
        id: "p3",
        name: "Lemongrass Essential Oil",
        description: "Refreshing aromatherapy oil.",
        price_thb: 450,
        category: "Aromatherapy",
        image_url: "/images/products/lemongrass.webp"
    },
    {
        id: "p4",
        name: "Handmade Soap Set",
        description: "Natural handmade soaps with essential oils.",
        price_thb: 300,
        category: "Skincare",
        image_url: "/images/products/soap-set.webp"
    }
];

export function StepAddons() {
    const t = useTranslations('Booking');
    const locale = useLocale();
    const { nextStep, prevStep, addons, setAddons } = useBookingStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchProducts = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('products')
                .select('*')
                .eq('is_active', true);

            if (error || !data || data.length === 0) {
                console.log("Using fallback products");
                setProducts(FALLBACK_PRODUCTS);
            } else {
                setProducts(data as unknown as Product[]);
            }
            setLoading(false);
        };

        fetchProducts();
    }, [supabase]);

    const getQuantity = (productId: string) => {
        const addon = addons.find(a => a.id === productId);
        return addon ? addon.quantity : 0;
    };

    const handleQuantityChange = (product: Product, delta: number) => {
        const currentQty = getQuantity(product.id);
        const newQty = Math.max(0, Math.min(10, currentQty + delta));

        if (newQty === 0) {
            // Remove from addons
            setAddons(addons.filter(a => a.id !== product.id));
        } else if (currentQty === 0) {
            // Add to addons with quantity
            setAddons([...addons, { ...product, quantity: newQty }]);
        } else {
            // Update quantity
            setAddons(addons.map(a => a.id === product.id ? { ...a, quantity: newQty } : a));
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900">{t('addons_selection.title')}</h2>
                <p className="text-gray-600">{t('addons_selection.subtitle')}</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-teal"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((product) => {
                        const quantity = getQuantity(product.id);
                        const isSelected = quantity > 0;

                        return (
                            <motion.div
                                key={product.id}
                                whileHover={{ scale: 1.02 }}
                                className={cn(
                                    "relative flex rounded-2xl overflow-hidden border-2 transition-all h-32",
                                    isSelected
                                        ? "border-aura-teal bg-aura-teal/5 shadow-md"
                                        : "border-gray-100 bg-white hover:border-aura-teal/30 hover:shadow-sm"
                                )}
                            >
                                <div className="w-32 h-full flex-shrink-0">
                                    <img
                                        src={product.image_url || "/placeholder.jpg"}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 text-sm">{getLocalizedContent(product.name, locale)}</h3>
                                            <span className="font-bold text-aura-teal text-sm">{t('price_thb', { price: product.price_thb })}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{getLocalizedContent(product.description, locale)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => handleQuantityChange(product, -1)}
                                            disabled={quantity === 0}
                                            className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                                                quantity > 0 ? "bg-aura-teal text-white hover:bg-teal-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            )}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className={cn(
                                            "w-8 text-center font-bold",
                                            quantity > 0 ? "text-aura-teal" : "text-gray-400"
                                        )}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(product, 1)}
                                            disabled={quantity >= 10}
                                            className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                                                quantity < 10 ? "bg-aura-teal text-white hover:bg-teal-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            )}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <div className="flex justify-between pt-4">
                <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-500 hover:bg-gray-100 transition-all"
                >
                    <ArrowLeft size={18} /> {t('back')}
                </button>
                <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-aura-teal text-white px-8 py-3 rounded-full font-medium hover:bg-teal-500 transition-all shadow-lg hover:shadow-aura-teal/25"
                >
                    {t('next')} <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}
