"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import Sidebar from "@/components/dashboard/Sidebar";
import CreateRefundModal from "@/components/dashboard/CreateRefundModal";
import BulkImportModal from "@/components/dashboard/BulkImportModal";
import RefundMethodModal from "@/components/dashboard/RefundMethodModal";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import {
    AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
    Activity, TrendingUp, AlertTriangle, ArrowUpRight, Plus, WifiOff, UserX, CheckCircle2, RefreshCw, Wallet
} from "lucide-react";
import Button from "@/components/ui/Button";
import BulkUpdateModal from "@/components/dashboard/BulkUpdateModal";

// Colors for Pie Chart
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const RADIAN = Math.PI / 180;

const _renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number }) => {
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
    const [user, setUser] = useState<import('firebase/auth').User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [volumeRange, setVolumeRange] = useState<number>(30);

    const router = useRouter();
    const auth = getAuth(app);

    // Data Hook (Auto-fetches when user is set)
    const { metrics, loading: _loadingMetrics, error: metricsError } = useDashboardMetrics(volumeRange);

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

    const handleMethodSelect = (method: 'manual' | 'bulk') => {
        setIsMethodModalOpen(false);
        if (method === 'manual') setIsCreateModalOpen(true);
        if (method === 'bulk') setIsImportModalOpen(true);
    };

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Authenticating...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] bg-[#050505] text-white">
                <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen">

                    {/* 1. HEADER SECTION */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
                            <div className="flex items-center gap-2 text-zinc-400 text-sm mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Live Data • All Time
                            </div>
                        </div>

                        {/* Actions Group */}
                        <div className="flex gap-3">
                            <Button onClick={() => setIsUpdateModalOpen(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
                                <RefreshCw className="w-4 h-4 mr-2" /> Update Status
                            </Button>
                            <Button onClick={() => setIsMethodModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                <Plus className="w-4 h-4 mr-2" /> New Refund
                            </Button>
                        </div>
                    </div>

                    {/* 2. METRICS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Settled</div>
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                    <Wallet size={18} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                                ₹{metrics?.totalSettledAmount?.toLocaleString('en-IN') || 0}
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                    <ArrowUpRight size={12} /> Secured
                                </span>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Active Liability</div>
                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                    <Activity size={18} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-orange-400 mb-1">
                                ₹{metrics?.activeLiability?.toLocaleString('en-IN') || 0}
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-orange-500/10 text-orange-500">
                                    <Activity size={12} /> In-Flight
                                </span>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Refund Count</div>
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <TrendingUp size={18} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-400 mb-1">
                                {metrics?.totalRefunds || 0}
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-500">
                                    <TrendingUp size={12} /> Lifetime
                                </span>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider">SLA Breaches</div>
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                    <AlertTriangle size={18} />
                                </div>
                            </div>
                            <div className={`text-3xl font-bold mb-1 ${metrics?.slaBreachCount ? 'text-red-500' : 'text-zinc-500'}`}>
                                {metrics?.slaBreachCount || 0}
                            </div>
                            <div>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${metrics?.slaBreachCount ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                    <AlertTriangle size={12} /> Action Required
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. CHARTS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Volume Chart (Left 2/3) */}
                        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Volume Trend</h3>
                                <select
                                    value={volumeRange}
                                    onChange={(e) => setVolumeRange(Number(e.target.value))}
                                    className="bg-zinc-800 border border-zinc-700 text-xs text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                                >
                                    <option value={7}>Last 7 Days</option>
                                    <option value={14}>Last 14 Days</option>
                                    <option value={30}>Last 30 Days</option>
                                    <option value={90}>Last 3 Months</option>
                                    <option value={180}>Last 6 Months</option>
                                    <option value={365}>Last Year</option>
                                </select>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics?.volumeData || []}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment Mix (Right 1/3) */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex flex-col h-[400px]">
                            <h3 className="text-lg font-semibold text-white mb-2">Payment Method Mix</h3>
                            <div className="flex-1 w-full min-h-0 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={metrics?.methodData || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {(metrics?.methodData || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold text-white">{metrics?.totalRefunds || 0}</span>
                                    <span className="text-xs text-zinc-500 uppercase tracking-widest">Total</span>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 justify-center pb-4">
                                {(metrics?.methodData || []).map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. FAILURES SECTION */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Failure Analysis</h3>
                                <p className="text-sm text-zinc-500">Actionable insights on rejected refunds</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-zinc-500">Total Stuck Amount</div>
                                <div className="text-xl font-bold text-red-500">₹{metrics?.stuckAmount?.toLocaleString() || 0}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
                            {/* Left: Chart */}
                            <div className="p-6 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={metrics?.failureReasonDistribution || []} margin={{ left: 10, right: 10 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                                        <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Right: List */}
                            <div className="p-6 max-h-[250px] overflow-y-auto space-y-3 custom-scrollbar">
                                <p className="text-sm text-zinc-500 mb-2">Recent Rejections:</p>
                                {(!metrics?.recentFailures || metrics.recentFailures.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-zinc-500 space-y-2">
                                        <CheckCircle2 size={32} className="text-emerald-500/50" />
                                        <p className="text-sm">No recent failures.</p>
                                    </div>
                                ) : (
                                    metrics.recentFailures.map((fail) => (
                                        <div key={fail.id} className="group flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                                    {(fail.failureReason || 'unknown').toLowerCase().includes('bank') ? <WifiOff size={14} /> :
                                                        (fail.failureReason || 'unknown').toLowerCase().includes('user') ? <UserX size={14} /> :
                                                            <AlertTriangle size={14} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-gray-200 font-medium truncate">#{fail.orderId}</p>
                                                        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 rounded truncate max-w-[120px]">
                                                            {fail.failureReason}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">₹{fail.amount}</p>
                                                </div>
                                            </div>

                                            <a
                                                href={`/t/${fail.id}`}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                            >
                                                <ArrowUpRight size={16} />
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 5. MODALS */}
                    <>
                        <CreateRefundModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={() => window.location.reload()} />
                        <BulkImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={() => window.location.reload()} />
                        <BulkUpdateModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onSuccess={() => window.location.reload()} />
                        <RefundMethodModal isOpen={isMethodModalOpen} onClose={() => setIsMethodModalOpen(false)} onSelect={handleMethodSelect} />
                    </>

                </div>
            </main>
        </div>
    );
}
