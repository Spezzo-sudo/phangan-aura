"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, TrendingUp, ShoppingCart, Calendar } from "lucide-react";

interface FinanceStats {
    totalRevenue: number;
    bookingRevenue: number;
    shopRevenue: number;
    totalBookings: number;
    totalOrders: number;
    avgBookingValue: number;
    avgOrderValue: number;
}

interface RevenueByMonth {
    month: string;
    bookings: number;
    shop: number;
}

export function FinanceDashboard() {
    const [stats, setStats] = useState<FinanceStats>({
        totalRevenue: 0,
        bookingRevenue: 0,
        shopRevenue: 0,
        totalBookings: 0,
        totalOrders: 0,
        avgBookingValue: 0,
        avgOrderValue: 0
    });
    const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonth[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                // Fetch bookings with total_price
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: bookings } = await (supabase as any)
                    .from('bookings')
                    .select('total_price, created_at')
                    .in('status', ['confirmed', 'completed']);

                // Fetch orders
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: orders } = await (supabase as any)
                    .from('orders')
                    .select('total_amount, created_at');

                let bookingRevenue = 0;
                let shopRevenue = 0;

                // Calculate booking revenue using total_price
                if (bookings) {
                    bookings.forEach((booking: { total_price?: number }) => {
                        bookingRevenue += booking.total_price || 0;
                    });
                }

                // Calculate shop revenue
                if (orders) {
                    orders.forEach((order: { total_amount: number }) => {
                        shopRevenue += order.total_amount || 0;
                    });
                }

                setStats({
                    totalRevenue: bookingRevenue + shopRevenue,
                    bookingRevenue,
                    shopRevenue,
                    totalBookings: bookings?.length || 0,
                    totalOrders: orders?.length || 0,
                    avgBookingValue: bookings?.length ? bookingRevenue / bookings.length : 0,
                    avgOrderValue: orders?.length ? shopRevenue / orders.length : 0
                });

                // Monthly breakdown - REAL DATA from last 6 months
                const monthlyData: RevenueByMonth[] = [];

                // Group bookings by month
                const bookingsByMonth = new Map<string, number>();
                if (bookings) {
                    bookings.forEach((booking: { total_price?: number, created_at: string }) => {
                        const date = new Date(booking.created_at);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        bookingsByMonth.set(monthKey, (bookingsByMonth.get(monthKey) || 0) + (booking.total_price || 0));
                    });
                }

                // Group orders by month
                const ordersByMonth = new Map<string, number>();
                if (orders) {
                    orders.forEach((order: { total_amount: number, created_at: string }) => {
                        const date = new Date(order.created_at);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        ordersByMonth.set(monthKey, (ordersByMonth.get(monthKey) || 0) + (order.total_amount || 0));
                    });
                }

                // Create array for last 6 months
                for (let i = 5; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const monthStr = date.toLocaleString('default', { month: 'short' });
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    monthlyData.push({
                        month: monthStr,
                        bookings: bookingsByMonth.get(monthKey) || 0,
                        shop: ordersByMonth.get(monthKey) || 0
                    });
                }
                setRevenueByMonth(monthlyData);

            } catch (error) {
                console.error("Error fetching finance data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFinanceData();
    }, [supabase]);

    if (loading) {
        return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aura-teal"></div></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">Finance Overview</h2>
                <p className="text-gray-600">Revenue statistics and financial insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-aura-teal to-teal-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign size={24} />
                        <span className="text-xs opacity-80">Total</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()} ฿</div>
                    <div className="text-xs opacity-90 mt-1">Total Revenue</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar size={24} className="text-blue-600" />
                        <span className="text-xs text-gray-500">Bookings</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.bookingRevenue.toLocaleString()} ฿</div>
                    <div className="text-xs text-gray-500 mt-1">{stats.totalBookings} confirmed bookings</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <ShoppingCart size={24} className="text-purple-600" />
                        <span className="text-xs text-gray-500">Shop</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.shopRevenue.toLocaleString()} ฿</div>
                    <div className="text-xs text-gray-500 mt-1">{stats.totalOrders} orders</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp size={24} className="text-green-600" />
                        <span className="text-xs text-gray-500">Avg. Value</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.avgBookingValue.toFixed(0)} ฿</div>
                    <div className="text-xs text-gray-500 mt-1">Per booking</div>
                </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Split */}
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="font-bold text-lg mb-4">Revenue Split</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Bookings</span>
                                <span className="font-bold text-gray-900">{stats.bookingRevenue.toLocaleString()} ฿</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all"
                                    style={{ width: `${stats.totalRevenue > 0 ? (stats.bookingRevenue / stats.totalRevenue) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Shop</span>
                                <span className="font-bold text-gray-900">{stats.shopRevenue.toLocaleString()} ฿</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div
                                    className="bg-purple-600 h-3 rounded-full transition-all"
                                    style={{ width: `${stats.totalRevenue > 0 ? (stats.shopRevenue / stats.totalRevenue) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="font-bold text-lg mb-4">Performance Metrics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Total Transactions</span>
                            <span className="font-bold text-gray-900">{stats.totalBookings + stats.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Avg. Booking Value</span>
                            <span className="font-bold text-gray-900">{stats.avgBookingValue.toFixed(0)} ฿</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Avg. Order Value</span>
                            <span className="font-bold text-gray-900">{stats.avgOrderValue.toFixed(0)} ฿</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <span className="text-gray-600 text-sm font-medium">Revenue per Transaction</span>
                            <span className="font-bold text-aura-teal">
                                {((stats.totalRevenue) / (stats.totalBookings + stats.totalOrders || 1)).toFixed(0)} ฿
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                <h3 className="font-bold text-lg mb-6">Revenue Trend (Last 6 Months)</h3>
                <div className="flex items-end justify-between gap-4 h-64">
                    {revenueByMonth.map((data, idx) => {
                        const maxRevenue = Math.max(...revenueByMonth.map(d => d.bookings + d.shop), 1);

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col gap-1 items-center">
                                    <div
                                        className="w-full bg-blue-500 rounded-t transition-all hover:opacity-80"
                                        style={{ height: `${(data.bookings / maxRevenue) * 200}px` }}
                                        title={`Bookings: ${data.bookings} ฿`}
                                    />
                                    <div
                                        className="w-full bg-purple-500 rounded-b transition-all hover:opacity-80"
                                        style={{ height: `${(data.shop / maxRevenue) * 200}px` }}
                                        title={`Shop: ${data.shop} ฿`}
                                    />
                                </div>
                                <div className="text-xs text-gray-600 font-medium">{data.month}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center gap-6 mt-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-gray-600">Bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span className="text-gray-600">Shop</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
