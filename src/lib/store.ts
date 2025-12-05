import { create } from 'zustand';
import { Database } from '@/types/database';

type Service = Database['public']['Tables']['services']['Row'];
type StaffProfile = Database['public']['Views']['public_profiles_view']['Row'];

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price_thb: number;
    image_url: string | null;
    category: string | null;
}

export interface AddonWithQuantity extends Product {
    quantity: number;
}

interface BookingState {
    step: number;
    category: string | null;
    service: Service | null;
    staff: StaffProfile | null;
    date: Date | null;
    time: string | null;
    address: string | null;
    locationNotes: string | null;
    lat: number | null;
    lng: number | null;
    addons: AddonWithQuantity[];

    // Actions
    setStep: (step: number) => void;
    setCategory: (category: string | null) => void;
    setService: (service: Service | null) => void;
    setStaff: (staff: StaffProfile | null) => void;
    setDate: (date: Date | null) => void;
    setTime: (time: string | null) => void;
    setLocation: (address: string, lat?: number, lng?: number) => void;
    setLocationNotes: (notes: string) => void;
    setAddons: (addons: AddonWithQuantity[]) => void;
    updateAddonQuantity: (productId: string, quantity: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
    step: 1,
    category: null,
    service: null,
    staff: null,
    date: null,
    time: null,
    address: null,
    locationNotes: null,
    lat: null,
    lng: null,
    addons: [],

    setStep: (step) => set({ step }),
    setCategory: (category) => set({ category }),
    setService: (service) => set({ service }),
    setStaff: (staff) => set({ staff }),
    setDate: (date) => set({ date }),
    setTime: (time) => set({ time }),
    setLocation: (address, lat, lng) => set({ address, lat, lng }),
    setLocationNotes: (locationNotes) => set({ locationNotes }),
    setAddons: (addons) => set({ addons }),
    updateAddonQuantity: (productId, quantity) => set((state) => {
        const existing = state.addons.find(a => a.id === productId);
        if (existing) {
            // Update existing
            if (quantity === 0) {
                return { addons: state.addons.filter(a => a.id !== productId) };
            }
            return { addons: state.addons.map(a => a.id === productId ? { ...a, quantity } : a) };
        }
        // This shouldn't happen but handle it anyway
        return state;
    }),
    nextStep: () => set((state) => ({ step: state.step + 1 })),
    prevStep: () => set((state) => ({ step: state.step - 1 })),
    reset: () => set({ step: 1, category: null, service: null, staff: null, date: null, time: null, address: null, locationNotes: null, lat: null, lng: null, addons: [] }),
}));
