import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    maxQuantity?: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    setItems: (items: CartItem[]) => void;
    clearCart: () => void;
    toggleCart: () => void;
    setOpen: (open: boolean) => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (newItem) => set((state) => {
                const existingItem = state.items.find(i => i.id === newItem.id);
                if (existingItem) {
                    return {
                        items: state.items.map(i => {
                            if (i.id !== newItem.id) return i;

                            const tentativeQuantity = i.quantity + 1;
                            const cappedQuantity = i.maxQuantity
                                ? Math.min(tentativeQuantity, i.maxQuantity)
                                : tentativeQuantity;

                            return { ...i, quantity: cappedQuantity };
                        })
                    };
                }
                return {
                    items: [
                        ...state.items,
                        {
                            ...newItem,
                            quantity: newItem.maxQuantity ? Math.min(1, newItem.maxQuantity) : 1,
                        }
                    ]
                };
            }),

            removeItem: (id) => set((state) => ({
                items: state.items.filter(i => i.id !== id)
            })),

            updateQuantity: (id, delta) => set((state) => ({
                items: state.items.map(i => {
                    if (i.id === id) {
                        const desiredQuantity = i.quantity + delta;
                        const boundedQuantity = Math.max(1, desiredQuantity);
                        const cappedQuantity = i.maxQuantity
                            ? Math.min(boundedQuantity, i.maxQuantity)
                            : boundedQuantity;

                        return { ...i, quantity: cappedQuantity };
                    }
                    return i;
                })
            })),

            setItems: (items) => set({ items }),

            clearCart: () => set({ items: [] }),

            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            setOpen: (open) => set({ isOpen: open }),

            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        }),
        {
            name: 'aura-cart-storage',
            partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
        }
    )
);
