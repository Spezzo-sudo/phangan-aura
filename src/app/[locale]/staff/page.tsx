"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Database } from "@/types/database";
import { AlertCircle, Calendar, Check, DollarSign } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { StaffSchedule } from "@/components/staff/StaffSchedule";
import { StaffServiceManager } from "@/components/staff/StaffServiceManager";
import { StaffEarningsDashboard } from "@/components/staff/StaffEarningsDashboard";
import { useTranslations } from "next-intl";

type Service = Database['public']['Tables']['services']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'] & {
    services: { title: string; duration_min: number; price_thb: number } | null;
};

export default function StaffDashboard() {
    const [user, setUser] = useState<Profile | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [myServiceIds, setMyServiceIds] = useState<string[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const t = useTranslations('StaffDashboard');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'schedule' | 'earnings' | 'services'>('schedule');

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "danger" | "success" | "info" | "warning";
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
        onConfirm: () => { },
    });

    const supabase = createClient();
    const router = useRouter();

    const checkUser = useCallback(async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push("/login");
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profile, error: profileError } = await (supabase as any)
                .from("profiles")
                .select("*")
                .eq("id", authUser.id)
                .single();

            if (profileError || !profile) {
                setErrorMsg("Could not load profile. Please contact admin.");
                setLoading(false);
                return;
            }

            if (profile.role !== "staff" && profile.role !== "admin") {
                setErrorMsg("Access denied. Staff only.");
                setLoading(false);
                return;
            }

            setUser(profile);
            fetchData(profile.id);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setErrorMsg("Unexpected error: " + errorMessage);
            setLoading(false);
        }
    }, [supabase, router]);

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    const fetchData = useCallback(async (userId: string) => {
        try {
            // 1. Fetch all available services
            const { data: allServices, error: servicesError } = await supabase
                .from("services")
                .select("*")
                .eq("is_active", true)
                .order("category");

            if (servicesError) throw servicesError;

            // 2. Fetch services already assigned to this staff
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: staffServices, error: staffServicesError } = await (supabase as any)
                .from("staff_services")
                .select("service_id")
                .eq("staff_id", userId);

            if (staffServicesError) throw staffServicesError;

            // 3. Fetch bookings for this staff
            const { data: myBookings, error: bookingsError } = await supabase
                .from("bookings")
                .select(`
                    *,
                    services (title, duration_min, price_thb)
                `)
                .eq("staff_id", userId)
                .order("start_time", { ascending: true });

            if (bookingsError) throw bookingsError;

            if (allServices) setServices(allServices);
            if (staffServices) setMyServiceIds(staffServices.map((ss: { service_id: string }) => ss.service_id));
            if (myBookings) setBookings(myBookings as Booking[]);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setErrorMsg("Error loading data: " + errorMessage);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const updateBookingStatus = async (bookingId: string, newStatus: string) => {
        try {
            const response = await fetch("/api/bookings/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking_id: bookingId,
                    status: newStatus
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Update failed");
            }

            // Refresh bookings
            if (user) {
                fetchData(user.id);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            alert(t('error_save', { error: errorMessage }));
        }
    };

    const handleActionClick = (bookingId: string, action: 'confirm' | 'cancel' | 'complete' | 'cancel_confirmed') => {
        let config: {
            title: string;
            message: string;
            type: "danger" | "success" | "info" | "warning";
            newStatus: string;
        } = {
            title: "",
            message: "",
            type: "info",
            newStatus: ""
        };

        switch (action) {
            case 'confirm':
                updateBookingStatus(bookingId, "confirmed");
                return;

            case 'cancel': // Reject pending
                config = {
                    title: t('modals.reject_title'),
                    message: t('modals.reject_msg'),
                    type: "danger",
                    newStatus: "cancelled"
                };
                break;

            case 'complete':
                config = {
                    title: t('modals.complete_title'),
                    message: t('modals.complete_msg'),
                    type: "success",
                    newStatus: "completed"
                };
                break;

            case 'cancel_confirmed':
                config = {
                    title: t('modals.cancel_title'),
                    message: t('modals.cancel_msg'),
                    type: "danger",
                    newStatus: "cancelled"
                };
                break;
        }

        setModalConfig({
            isOpen: true,
            title: config.title,
            message: config.message,
            type: config.type,
            onConfirm: () => {
                updateBookingStatus(bookingId, config.newStatus);
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const toggleService = (serviceId: string) => {
        setMyServiceIds(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const saveChanges = async () => {
        if (!user) return;
        setSaving(true);
        setErrorMsg(null);

        try {
            // 1. Delete all existing links for this staff
            const { error: deleteError } = await supabase
                .from("staff_services")
                .delete()
                .eq("staff_id", user.id);

            if (deleteError) throw deleteError;

            // 2. Insert new links
            if (myServiceIds.length > 0) {
                const inserts = myServiceIds.map(serviceId => ({
                    staff_id: user.id,
                    service_id: serviceId
                }));

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: insertError } = await (supabase as any)
                    .from("staff_services")
                    .insert(inserts);

                if (insertError) throw insertError;
            }

            alert(t('success_update'));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setErrorMsg(t('error_save', { error: errorMessage }));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-aura-sand flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-teal"></div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <main className="min-h-screen bg-aura-sand pt-32 px-4">
                <Navbar />
                <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{errorMsg}</p>
                    <button onClick={() => window.location.reload()} className="bg-gray-900 text-white px-6 py-2 rounded-full">
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-aura-sand selection:bg-aura-teal/20 pb-20">
            <Navbar />

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}

                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                confirmText={modalConfig.type === 'danger' ? t('modals.proceed_btn') : t('modals.confirm_btn')}
                cancelText={t('modals.cancel_btn')}
            />

            <div className="pt-32 container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-serif font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-600">{t('welcome', { name: user?.full_name || 'Staff' })}</p>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-aura-teal/10 text-aura-teal">
                        {t('role', { role: user?.role || 'staff' })}
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 pb-1">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`pb-3 px-2 font-medium transition-colors relative ${activeTab === 'schedule' ? 'text-aura-teal' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar size={18} /> {t('tabs.schedule')}
                        </div>
                        {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-aura-teal rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('earnings')}
                        className={`pb-3 px-2 font-medium transition-colors relative ${activeTab === 'earnings' ? 'text-aura-teal' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign size={18} /> {t('tabs.earnings')}
                        </div>
                        {activeTab === 'earnings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-aura-teal rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`pb-3 px-2 font-medium transition-colors relative ${activeTab === 'services' ? 'text-aura-teal' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Check size={18} /> {t('tabs.services')}
                        </div>
                        {activeTab === 'services' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-aura-teal rounded-t-full"></div>}
                    </button>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 min-h-[400px]">

                    {/* SCHEDULE TAB */}
                    {activeTab === 'schedule' && (
                        <StaffSchedule
                            bookings={bookings}
                            onAction={handleActionClick}
                        />
                    )}

                    {/* EARNINGS TAB */}
                    {activeTab === 'earnings' && user && (
                        <StaffEarningsDashboard staffId={user.id} />
                    )}

                    {/* SERVICES TAB */}
                    {activeTab === 'services' && (
                        <StaffServiceManager
                            services={services}
                            myServiceIds={myServiceIds}
                            onToggleService={toggleService}
                            onSave={saveChanges}
                            saving={saving}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
