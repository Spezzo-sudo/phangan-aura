"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { X, Check, Save } from "lucide-react";

type Service = Database['public']['Tables']['services']['Row'];

interface StaffServiceManagerProps {
    staffId: string;
    staffName: string;
    onClose: () => void;
}

import { useLocale } from "next-intl";
import { getLocalizedContent } from "@/lib/i18n-utils";

export function StaffServiceManager({ staffId, staffName, onClose }: StaffServiceManagerProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [myServiceIds, setMyServiceIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();
    const locale = useLocale();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // 1. Fetch all services
        const { data: allServices } = await supabase
            .from("services")
            .select("*")
            .eq("is_active", true)
            .order("category");

        // 2. Fetch assigned services
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: staffServices } = await (supabase as any)
            .from("staff_services")
            .select("service_id")
            .eq("staff_id", staffId);

        if (allServices) setServices(allServices);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (staffServices) setMyServiceIds(staffServices.map((ss: any) => ss.service_id));
        setLoading(false);
    };

    const toggleService = (serviceId: string) => {
        setMyServiceIds(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const saveChanges = async () => {
        setSaving(true);

        // 1. Delete existing
        await supabase.from("staff_services").delete().eq("staff_id", staffId);

        // 2. Insert new
        if (myServiceIds.length > 0) {
            const inserts = myServiceIds.map(sid => ({ staff_id: staffId, service_id: sid }));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from("staff_services").insert(inserts);
        }

        setSaving(false);
        onClose(); // Close modal after save
        alert(`Services updated for ${staffName}`);
    };

    // Group by category
    const servicesByCategory = services.reduce((acc, service) => {
        const cat = service.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(service);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold text-gray-900">Manage Services for {staffName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(servicesByCategory).map(([category, catServices]) => (
                                <div key={category}>
                                    <h4 className="font-bold text-gray-900 capitalize mb-3">{category}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {catServices.map(service => (
                                            <div
                                                key={service.id}
                                                onClick={() => toggleService(service.id)}
                                                className={`
                          flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                          ${myServiceIds.includes(service.id)
                                                        ? "border-aura-teal bg-aura-teal/5 ring-1 ring-aura-teal"
                                                        : "border-gray-200 hover:border-aura-teal/30"}
                        `}
                                            >
                                                <span className="text-sm font-medium text-gray-700">{getLocalizedContent(service.title, locale)}</span>
                                                {myServiceIds.includes(service.id) && <Check size={16} className="text-aura-teal" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={saveChanges}
                        disabled={saving}
                        className="px-6 py-2 bg-aura-teal text-white rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center gap-2"
                    >
                        {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
