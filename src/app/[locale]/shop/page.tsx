"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { ShoppingBag, Star, AlertCircle } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { getLocalizedContent } from "@/lib/i18n-utils";

type Product = Database['public']['Tables']['products']['Row'];

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem, setOpen } = useCartStore();
    const t = useTranslations('Shop');
    const locale = useLocale();
    const supabase = createClient();

    useEffect(() => {
        console.log("Supabase Config Check:", {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
        });

        const fetchProducts = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('category');

            if (error) {
                console.error("Error fetching products:", error);
                console.error("Error details:", {
                    message: (error as any)?.message,
                    details: (error as any)?.details,
                    hint: (error as any)?.hint,
                    code: (error as any)?.code
                });
            } else if (data) {
                setProducts(data as Product[]);
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id,
            name: getLocalizedContent(product.name, locale),
            price: product.price_thb,
            image: product.image_url || undefined,
            maxQuantity: product.stock_quantity ?? undefined,
        });
        setOpen(true);
    };

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />

            <div className="pt-32 container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-gray-900"
                    >
                        {t('title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        {t('subtitle')}
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-teal"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No products available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, index) => {
                            const stock = product.stock_quantity ?? 0;
                            const isOutOfStock = stock <= 0;
                            const isLowStock = stock > 0 && stock < 5;

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.2 }}
                                    className={`bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-white/50 group flex flex-col h-full ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
                                >
                                    <div className="relative h-64 overflow-hidden shrink-0">
                                        <img
                                            src={product.image_url || "/images/placeholder.webp"}
                                            alt={getLocalizedContent(product.name, locale)}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {product.category && (
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm capitalize">
                                                {product.category}
                                            </div>
                                        )}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-6 border-2 border-white">
                                                    OUT OF STOCK
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-serif font-bold text-lg text-gray-900 line-clamp-1">
                                                {getLocalizedContent(product.name, locale)}
                                            </h3>
                                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
                                                <Star size={12} fill="currentColor" />
                                                5.0
                                            </div>
                                        </div>

                                        {product.description && (
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                                                {getLocalizedContent(product.description, locale)}
                                            </p>
                                        )}

                                        {/* Stock Indicator */}
                                        <div className="mb-4">
                                            {isOutOfStock ? (
                                                <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                                                    <AlertCircle size={12} />
                                                    <span>Currently unavailable</span>
                                                </div>
                                            ) : isLowStock ? (
                                                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    <span>Only {stock} left in stock!</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    <span>In Stock ({stock})</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                            <span className="text-aura-teal font-bold text-lg">{product.price_thb} THB</span>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={isOutOfStock}
                                                className={`
                                                    p-3 rounded-full transition-colors shadow-lg flex items-center justify-center
                                                    ${isOutOfStock
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                                        : "bg-gray-900 text-white hover:bg-aura-teal hover:shadow-aura-teal/25"
                                                    }
                                                `}
                                            >
                                                <ShoppingBag size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
