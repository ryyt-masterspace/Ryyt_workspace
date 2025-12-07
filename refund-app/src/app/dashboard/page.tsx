"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import Sidebar from "@/components/dashboard/Sidebar";
import CreateRefundModal from "@/components/dashboard/CreateRefundModal";
import BulkImportModal from "@/components/dashboard/BulkImportModal";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import {
    AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import {
    Activity, TrendingUp, AlertTriangle, IndianRupee, Banknote, ShieldCheck,
    ArrowUpRight, Plus, FileSpreadsheet, FileSignature
} from "lucide-react";
import Button from "@/components/ui/Button";
import BulkUpdateModal from "@/components/dashboard/BulkUpdateModal";

// Colors for Pie Chart
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    ) : null;
};

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const router = useRouter();
    const auth = getAuth(app);

    // Data Hook (Auto-fetches when user is set)
    const { metrics, loading: loadingMetrics } = useDashboardMetrics();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/login");
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth, router]);

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Authenticating...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] p-8 bg-[#050505] text-white">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Analytics Overview</h1>
                            <p className="text-gray-500 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live Data • All Time
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setIsBulkModalOpen(true)}
                                className="flex items-center gap-2 border border-white/10 hover:bg-white/5"
                            >
                                <FileSpreadsheet size={16} /> Import CSV
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setIsUpdateModalOpen(true)}
                                className="flex items-center gap-2 border border-white/10 hover:bg-white/5 text-yellow-500 hover:text-yellow-400"
                            >
                                <FileSignature size={16} /> Update Status
                            </Button>

                            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                                <Plus size={16} /> New Refund
                            </Button>
                        </div>
                    </div>

                    {/* Layer 1: Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* 1. Total Settled */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#111] border border-white/5 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Banknote size={48} className="text-green-500" />
                            </div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Total Settled</p>
                            <h3 className="text-3xl font-bold text-green-400 flex items-center gap-1">
                                <span className="text-lg">₹</span>
                                {loadingMetrics ? "..." : new Intl.NumberFormat('en-IN').format(metrics?.totalSettledAmount || 0)}
                            </h3>
                            <div className="mt-4 flex items-center gap-1 text-xs text-green-500/80 bg-green-500/10 w-fit px-2 py-1 rounded-full">
                                <ArrowUpRight size={12} />
                                <span>Secured</span>
                            </div>
                        </div>

                        {/* 2. Active Liability */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#111] border border-white/5 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Activity size={48} className="text-orange-500" />
                            </div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Active Liability</p>
                            <h3 className="text-3xl font-bold text-orange-400 flex items-center gap-1">
                                <span className="text-lg">₹</span>
                                {loadingMetrics ? "..." : new Intl.NumberFormat('en-IN').format(metrics?.activeLiability || 0)}
                            </h3>
                            <div className="mt-4 flex items-center gap-1 text-xs text-orange-500/80 bg-orange-500/10 w-fit px-2 py-1 rounded-full">
                                <Activity size={12} />
                                <span>In-Flight</span>
                            </div>
                        </div>

                        {/* 3. Total Volume */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#111] border border-white/5 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp size={48} className="text-blue-500" />
                            </div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Total Refund Count</p>
                            <h3 className="text-3xl font-bold text-blue-400">
                                {loadingMetrics ? "..." : metrics?.totalRefunds || 0}
                            </h3>
                            <div className="mt-4 flex items-center gap-1 text-xs text-blue-500/80 bg-blue-500/10 w-fit px-2 py-1 rounded-full">
                                <TrendingUp size={12} />
                                <span>Lifetime Processed</span>
                            </div>
                        </div>

                        {/* 4. SLA Risk */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#111] border border-white/5 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertTriangle size={48} className="text-red-500" />
                            </div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">SLA Breaches</p>
                            <h3 className={`text-3xl font-bold ${metrics?.slaBreachCount && metrics.slaBreachCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {loadingMetrics ? "..." : metrics?.slaBreachCount || 0}
                            </h3>
                            <div className={`mt-4 flex items-center gap-1 text-xs w-fit px-2 py-1 rounded-full ${metrics?.slaBreachCount && metrics.slaBreachCount > 0 ? 'text-red-500/80 bg-red-500/10' : 'text-gray-500 bg-gray-500/10'}`}>
                                <AlertTriangle size={12} />
                                <span>Action Required</span>
                            </div>
                        </div>
                    </div>

                    {/* Layer 2: Main Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">

                        {/* Volume Chart (Area) */}
                        <div className="lg:col-span-2 bg-[#0A0A0A] rounded-xl border border-white/5 p-6 flex flex-col">
                            <h3 className="text-sm font-semibold text-gray-300 mb-6">Volume Trend (Last 14 Days)</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics?.volumeData || []}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#666"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Mix Chart (Pie) */}
                        <div className="lg:col-span-1 bg-[#0A0A0A] rounded-xl border border-white/5 p-6 flex flex-col">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2">Payment Method Mix</h3>
                            <div className="flex-1 w-full min-h-0 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={metrics?.methodData || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={80}
                                            innerRadius={50}
                                            fill="#8884d8"
                                            dataKey="value"
                                            paddingAngle={5}
                                        >
                                            {(metrics?.methodData || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Center Stat */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{metrics?.totalRefunds || 0}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total</p>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-2 justify-center mt-2">
                                {(metrics?.methodData || []).map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Layer 3: Failure Health Bar */}
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/5 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-sm font-semibold text-gray-300">Failure Analysis</h3>
                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/5 rounded-full">Recent Rejections</span>
                        </div>

                        <div className="space-y-2">
                            {(!metrics?.recentFailures || metrics.recentFailures.length === 0) ? (
                                <p className="text-sm text-gray-600 italic py-4">No recent failures recorded. Good health!</p>
                            ) : (
                                metrics.recentFailures.slice(0, 5).map((fail) => (
                                    <div key={fail.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                                <Activity size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-200 font-medium">Order #{fail.orderId}</p>
                                                <p className="text-xs text-red-300/80">{fail.failureReason}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-mono text-gray-400">
                                            ₹{fail.amount}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>



                {/* Modals */}
                < CreateRefundModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)
                    }
                    onSuccess={() => window.location.reload()}
                />
                < BulkImportModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    onSuccess={() => window.location.reload()}
                />
                < BulkUpdateModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onSuccess={() => window.location.reload()}
                />

            </main >
        </div >
    );
}
