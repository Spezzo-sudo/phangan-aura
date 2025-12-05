"use client";

import { Save, Check } from "lucide-react";
import { Database } from "@/types/database";

type Service = Database['public']['Tables']['services']['Row'];

interface StaffServiceManagerProps {
    services: Service[];
    myServiceIds: string[];
    onToggleService: (serviceId: string) => void;
    onSave: () => void;
    saving: boolean;
}

import { useLocale } from "next-intl";
import { getLocalizedContent } from "@/lib/i18n-utils";

export function StaffServiceManager({ services, myServiceIds, onToggleService, onSave, saving }: StaffServiceManagerProps) {
    const locale = useLocale();
    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
        const cat = service.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(service);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">My Services</h2>
                    <p className="text-sm text-gray-500">Select the treatments you perform.</p>
                </div>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-aura-teal text-white px-6 py-3 rounded-full font-medium hover:bg-teal-500 transition-all disabled:opacity-50 shadow-lg hover:shadow-aura-teal/25"
                >
                    {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            {services.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No services found in the database.</p>
                    <p className="text-xs text-gray-400 mt-1">Please ask Admin to seed services.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                        <div key={category}>
                            <h3 className="text-lg font-bold text-gray-900 capitalize mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-aura-teal"></span>
                                {category}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryServices.map((service) => (
                                    <div
                                        key={service.id}
                                        onClick={() => onToggleService(service.id)}
                                        className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${myServiceIds.includes(service.id)
                                            ? "border-aura-teal bg-aura-teal/5 shadow-md"
                                            : "border-gray-200 bg-white hover:border-aura-teal/30 hover:shadow-sm"
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{getLocalizedContent(service.title, locale)}</div>
                                            <div className="text-xs text-gray-500 mt-1">{service.duration_min} min • {service.price_thb} THB</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${myServiceIds.includes(service.id) ? "bg-aura-teal text-white" : "bg-gray-100 text-gray-300"
                                            }`}>
                                            <Check size={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
