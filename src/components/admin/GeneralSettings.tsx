"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Save, Loader2 } from "lucide-react";

interface PaymentSettings {
    enable_stripe: boolean;
    enable_cash: boolean;
    stripe_public_key?: string;
}

export function GeneralSettings() {
    const [settings, setSettings] = useState<PaymentSettings>({
        enable_stripe: false,
        enable_cash: true,
        stripe_public_key: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('company_settings')
                .select('setting_value')
                .eq('setting_key', 'payment_config')
                .single();

            if (data) {
                setSettings(data.setting_value);
            } else if (!error) {
                await saveSettings({
                    enable_stripe: false,
                    enable_cash: true
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (newSettings: PaymentSettings) => {
        setSaving(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('company_settings')
                .upsert({
                    setting_key: 'payment_config',
                    setting_value: newSettings,
                    description: 'Global payment configuration'
                }, { onConflict: 'setting_key' });

            if (error) throw error;
            setSettings(newSettings);
            alert("✅ Settings saved successfully!");
        } catch (error) {
            console.error('Error saving settings:', error);
            alert("❌ Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">General Settings</h2>
                <p className="text-gray-600">Configure global application behavior.</p>
            </div>

            {/* Payment Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Payment Methods</h3>
                        <p className="text-sm text-gray-500">Control how customers can pay.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div className="font-medium text-gray-900">Cash on Arrival</div>
                            <div className="text-xs text-gray-500">Customers pay in cash at the location.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.enable_cash}
                                onChange={(e) => setSettings({ ...settings, enable_cash: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div className="font-medium text-gray-900">Online Payment (Stripe)</div>
                            <div className="text-xs text-gray-500">Customers pay online via Credit Card.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.enable_stripe}
                                onChange={(e) => setSettings({ ...settings, enable_stripe: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {!settings.enable_cash && !settings.enable_stripe && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            Warning: At least one payment method must be enabled!
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t flex justify-end">
                    <button
                        onClick={() => saveSettings(settings)}
                        disabled={saving || (!settings.enable_cash && !settings.enable_stripe)}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Dangerous Actions */}
            <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                        ⚠️
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900">Danger Zone</h3>
                        <p className="text-sm text-red-600">These actions cannot be undone!</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Reset Bookings */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-red-200">
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">Reset All Bookings</div>
                            <div className="text-xs text-gray-500 mt-1">
                                Deletes bookings, orders, blockers. <span className="font-semibold text-orange-600">Finances unchanged.</span>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (!confirm("⚠️ DELETE ALL BOOKINGS?\n\nThis deletes:\n- Bookings\n- Orders\n- Blockers\n\nProfiles & Finances remain.")) return;
                                const conf = prompt("Type 'DELETE':");
                                if (conf !== 'DELETE') { alert("❌ Cancelled"); return; }
                                try {
                                    const res = await fetch('/api/admin/reset-bookings', { method: 'POST' });
                                    const data = await res.json();
                                    if (res.ok) { alert(`✅ ${data.message}`); window.location.reload(); }
                                    else throw new Error(data.error);
                                } catch (e: any) { alert(`❌ ${e.message}`); }
                            }}
                            className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                            Reset Bookings
                        </button>
                    </div>

                    {/* Reset Finances */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-orange-200">
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">Reset Loan Tracker</div>
                            <div className="text-xs text-gray-500 mt-1">
                                Resets loan to zero. <span className="font-semibold text-orange-600">Bookings unchanged.</span>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (!confirm("⚠️ RESET FINANCES?\n\nThis resets:\n- Loan amount → 0\n- Repaid → 0\n\nBookings remain.")) return;
                                const conf = prompt("Type 'RESET':");
                                if (conf !== 'RESET') { alert("❌ Cancelled"); return; }
                                try {
                                    const res = await fetch('/api/admin/reset-finances', { method: 'POST' });
                                    const data = await res.json();
                                    if (res.ok) { alert(`✅ ${data.message}`); window.location.reload(); }
                                    else throw new Error(data.error);
                                } catch (e: any) { alert(`❌ ${e.message}`); }
                            }}
                            className="ml-4 px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
                        >
                            Reset Finances
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
