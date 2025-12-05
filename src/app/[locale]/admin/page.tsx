"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Database, UserRole } from "@/types/database";
import { StaffServiceManager } from "@/components/admin/StaffServiceManager";
import { BookingManager } from "@/components/admin/BookingManager";
import { ProductManager } from "@/components/admin/ProductManager";
import { FinanceDashboard } from "@/components/admin/FinanceDashboard";
import { AccountingDashboard } from "@/components/admin/AccountingDashboard";
import { LoanTracker } from "@/components/admin/LoanTracker";
import { GeneralSettings } from "@/components/admin/GeneralSettings";
import { StaffPayoutDashboard } from "@/components/admin/StaffPayoutDashboard";
import { UserRoleManager } from "@/components/admin/UserRoleManager";
import { Tooltip } from "@/components/ui/Tooltip";
import { Calendar, Users, ShoppingBag, DollarSign, TrendingUp, PieChart, Settings, UserCheck, Shield, Database as DatabaseIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function AdminDashboard() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState<{ id: string, name: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'products' | 'accounting' | 'staff-payouts' | 'finance' | 'loan' | 'settings'>('users');
    const [seeding, setSeeding] = useState(false);
    const [seedMsg, setSeedMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const supabase = createClient();
    const t = useTranslations('AdminDashboard');

    const fetchProfiles = useCallback(async () => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching profiles:", error);
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    }, [supabase]);

    const fetchUser = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
            } else {
                setProfile(data);
            }
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchProfiles();
        fetchUser();
    }, [fetchProfiles, fetchUser]);

    const updateRole = async (userId: string, newRole: UserRole) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) {
            alert("Error updating role");
        } else {
            fetchProfiles();
        }
    };

    const seedServices = async () => {
        setSeeding(true);
        setSeedMsg(null);

        try {
            const { count, error: countError } = await supabase
                .from("services")
                .select("*", { count: 'exact', head: true });

            if (countError) throw countError;

            if (count && count > 0) {
                setSeedMsg({ type: 'error', text: t('users.seed_error', { count }) });
                setSeeding(false);
                return;
            }

            const { MOCK_SERVICES } = await import("@/lib/mock-data");
            const servicesToInsert = MOCK_SERVICES.map(({ id, ...rest }) => rest);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: insertError } = await (supabase as any)
                .from("services")
                .insert(servicesToInsert);

            if (insertError) throw insertError;

            setSeedMsg({ type: 'success', text: "Services seeded successfully! You can now assign them." });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            console.error("Seeding error:", err);
            setSeedMsg({ type: 'error', text: "Error: " + errorMessage });
        } finally {
            setSeeding(false);
        }
    };

    const staffCount = profiles.filter(p => p.role === 'staff').length;

    const tabs = [
        { id: "users", label: t('tabs.users'), icon: Users },
        { id: "bookings", label: t('tabs.bookings'), icon: Calendar },
        { id: "products", label: t('tabs.products'), icon: ShoppingBag },
        { id: "accounting", label: t('tabs.accounting'), icon: DollarSign },
        { id: "staff-payouts", label: t('tabs.payouts'), icon: UserCheck },
        { id: "finance", label: t('tabs.finance'), icon: TrendingUp },
        { id: "loan", label: t('tabs.loans'), icon: PieChart },
        { id: "settings", label: t('tabs.settings'), icon: Settings },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-teal"></div>
            </div>
        );
    }

    if (!profile || profile.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="pt-32 container mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">{t('title')}</h1>
                        <p className="text-gray-600">{t('subtitle')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Stats Cards - Inline */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Users size={24} />
                            <span className="text-sm opacity-80">{t('stats.total_users')}</span>
                        </div>
                        <div className="text-3xl font-bold">{profiles.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Shield size={24} />
                            <span className="text-sm opacity-80">{t('stats.staff')}</span>
                        </div>
                        <div className="text-3xl font-bold">{profiles.filter(u => u.role === 'staff').length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar size={24} />
                            <span className="text-sm opacity-80">Active Bookings</span>
                        </div>
                        <div className="text-3xl font-bold">0</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign size={24} />
                            <span className="text-sm opacity-80">Revenue (Month)</span>
                        </div>
                        <div className="text-3xl font-bold">0 THB</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-aura-teal text-aura-teal'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">{t('users.title')}</h2>
                                    <div className="flex gap-2">
                                        {seedMsg && (
                                            <div className={`text-sm px-4 py-2 rounded-lg ${seedMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {seedMsg.text}
                                            </div>
                                        )}
                                        <Tooltip content="Populates the database with sample wellness services (Massage, Facial, etc.) for testing and demo purposes. Only works if no services exist yet.">
                                            <button
                                                onClick={seedServices}
                                                disabled={seeding}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                                            >
                                                <DatabaseIcon size={16} />
                                                {seeding ? t('users.seeding') : t('users.seed_btn')}
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="pb-3 font-semibold text-gray-500">{t('users.table.user')}</th>
                                                <th className="pb-3 font-semibold text-gray-500">{t('users.table.email')}</th>
                                                <th className="pb-3 font-semibold text-gray-500">{t('users.table.role')}</th>
                                                <th className="pb-3 font-semibold text-gray-500">{t('users.table.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {profiles.map((user) => (
                                                <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                                                                {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                            <span className="font-medium text-gray-900">{user.full_name || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-gray-600">{user.email}</td>
                                                    <td className="py-4">
                                                        <span className={`
                                                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                                user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'}
                                                        `}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex gap-2 flex-wrap">
                                                            {user.role === 'staff' && (
                                                                <Tooltip content="Configure which services this staff member can provide">
                                                                    <button
                                                                        onClick={() => setSelectedStaff({ id: user.id, name: user.full_name || "Staff" })}
                                                                        className="text-xs bg-aura-teal/10 text-aura-teal px-3 py-1 rounded-full hover:bg-aura-teal/20 transition-colors"
                                                                    >
                                                                        {t('users.manage_services')}
                                                                    </button>
                                                                </Tooltip>
                                                            )}
                                                            <UserRoleManager
                                                                currentRole={user.role || 'customer'}
                                                                onUpdate={(newRole) => updateRole(user.id, newRole)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'bookings' && <BookingManager />}
                        {activeTab === 'products' && <ProductManager />}
                        {activeTab === 'accounting' && <AccountingDashboard />}
                        {activeTab === 'staff-payouts' && <StaffPayoutDashboard />}
                        {activeTab === 'finance' && <FinanceDashboard />}
                        {activeTab === 'loan' && <LoanTracker />}
                        {activeTab === 'settings' && <GeneralSettings />}
                    </div>
                </div>
            </div>
        </main>
    );
}
