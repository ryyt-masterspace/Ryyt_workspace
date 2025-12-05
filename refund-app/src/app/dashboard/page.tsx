"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Button from "@/components/ui/Button";
import CreateRefundModal from "@/components/dashboard/CreateRefundModal";
import RefundDetailsPanel from "@/components/dashboard/RefundDetailsPanel";
import {
    Plus, LogOut, Search, ExternalLink, Check,
    TrendingUp, AlertTriangle, Activity, Clock, CreditCard, Smartphone,
    Landmark, Banknote, Wallet, ShieldAlert, Filter
} from "lucide-react";

interface Refund {
    id: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
    createdAt: any;
    slaDueDate?: string;
    paymentMethod?: string;
    proofs?: {
        utr?: string;
    };
}

type FilterTab = 'ALL' | 'ACTION' | 'OVERDUE' | 'SETTLED';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [isLoadingRefunds, setIsLoadingRefunds] = useState(true);

    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTab, setFilterTab] = useState<FilterTab>('ALL');

    // Stats State
    const [stats, setStats] = useState({
        activeCount: 0,
        riskValue: 0,
        breachCount: 0,
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            const q = query(
                collection(db, "refunds"),
                where("merchantId", "==", user.uid)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const refundList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Refund[];

                // Initial sort (will be reinforced in useMemo)
                refundList.sort((a, b) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });

                setRefunds(refundList);
                calculateStats(refundList);
                setIsLoadingRefunds(false);
            });

            return () => unsubscribe();
        }
    }, [user, loading, router]);

    const calculateStats = (data: Refund[]) => {
        const now = new Date();
        let active = 0;
        let riskVal = 0;
        let breaches = 0;

        data.forEach(r => {
            if (r.status !== "SETTLED") {
                active++;

                if (r.slaDueDate) {
                    const due = new Date(r.slaDueDate);
                    if (now > due) {
                        riskVal += Number(r.amount);
                        breaches++;
                    }
                }
            }
        });

        setStats({
            activeCount: active,
            riskValue: riskVal,
            breachCount: breaches
        });
    };

    // Filtering & Sorting Logic
    const filteredRefunds = useMemo(() => {
        const filtered = refunds.filter(refund => {
            // 1. Search Filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                refund.orderId.toLowerCase().includes(searchLower) ||
                refund.customerName.toLowerCase().includes(searchLower) ||
                refund.amount.toString().includes(searchLower);

            if (!matchesSearch) return false;

            // 2. Tab Filter
            const isOverdue = refund.status !== "SETTLED" && refund.slaDueDate && new Date() > new Date(refund.slaDueDate);

            switch (filterTab) {
                case 'ACTION':
                    return ['DRAFT', 'GATHERING_DATA', 'FAILED'].includes(refund.status);
                case 'OVERDUE':
                    return isOverdue;
                case 'SETTLED':
                    return refund.status === 'SETTLED';
                case 'ALL':
                default:
                    return true;
            }
        });

        // 3. Client-Side Sorting (Critical)
        return filtered.sort((a, b) => {
            const getDate = (r: Refund) => r.createdAt?.seconds ? r.createdAt.seconds * 1000 : 0;
            return getDate(b) - getDate(a);
        });

    }, [refunds, searchTerm, filterTab]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const openTracking = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        window.open(`/t/${id}`, '_blank');
    };

    const getMethodIcon = (method?: string) => {
        switch (method) {
            case 'UPI': return <Smartphone size={16} className="text-blue-400" />;
            case 'CREDIT_CARD':
            case 'DEBIT_CARD': return <CreditCard size={16} className="text-purple-400" />;
            case 'NETBANKING': return <Landmark size={16} className="text-orange-400" />;
            case 'WALLET': return <Wallet size={16} className="text-pink-400" />;
            case 'COD': return <Banknote size={16} className="text-green-400" />;
            default: return <CreditCard size={16} className="text-gray-400" />;
        }
    };

    const isOverdue = (refund: Refund) => {
        if (refund.status === "SETTLED" || !refund.slaDueDate) return false;
        return new Date() > new Date(refund.slaDueDate);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp?.seconds) return "-";
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Refunds</h1>
                        <p className="text-gray-400 text-sm">Manage and track all your refund requests.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden md:block">{user.email}</span>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut size={16} className="mr-2" />
                            Sign Out
                        </Button>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} className="mr-2" />
                            New Refund
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Refunds</p>
                            <h3 className="text-2xl font-bold text-white">{stats.activeCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Activity size={20} />
                        </div>
                    </div>

                    <div className={`bg-[#0A0A0A] border rounded-xl p-5 flex items-center justify-between ${stats.riskValue > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'}`}>
                        <div>
                            <p className={`text-xs uppercase tracking-wider mb-1 ${stats.riskValue > 0 ? 'text-red-400' : 'text-gray-400'}`}>Value at Risk</p>
                            <h3 className={`text-2xl font-bold ${stats.riskValue > 0 ? 'text-red-500' : 'text-white'}`}>
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.riskValue)}
                            </h3>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.riskValue > 0 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            <AlertTriangle size={20} />
                        </div>
                    </div>

                    <div className={`bg-[#0A0A0A] border rounded-xl p-5 flex items-center justify-between ${stats.breachCount > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'}`}>
                        <div>
                            <p className={`text-xs uppercase tracking-wider mb-1 ${stats.breachCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>SLA Breaches</p>
                            <h3 className={`text-2xl font-bold ${stats.breachCount > 0 ? 'text-red-500' : 'text-white'}`}>{stats.breachCount}</h3>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.breachCount > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-400'}`}>
                            <ShieldAlert size={20} />
                        </div>
                    </div>
                </div>

                {/* Command Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer, or Amount..."
                            className="w-full bg-[#0A0A0A] border border-white/5 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-[#0A0A0A] border border-white/5 rounded-xl p-1 gap-1 overflow-x-auto">
                        {(['ALL', 'ACTION', 'OVERDUE', 'SETTLED'] as FilterTab[]).map((tab) => {
                            const isActive = filterTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setFilterTab(tab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab.charAt(0) + tab.slice(1).toLowerCase().replace('_', ' ')}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                {isLoadingRefunds ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : refunds.length === 0 ? (
                    // Empty State (No refunds at all)
                    <div className="border border-white/10 rounded-2xl bg-white/5 border-dashed flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Search size={24} className="text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No refunds yet</h3>
                        <p className="text-gray-400 max-w-sm mb-6">
                            Create your first refund request to start tracking the process and building trust with your customers.
                        </p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} className="mr-2" />
                            Create First Refund
                        </Button>
                    </div>
                ) : filteredRefunds.length === 0 ? (
                    // Empty State (Filtered results empty)
                    <div className="border border-white/10 rounded-2xl bg-[#0A0A0A] flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                            <Filter size={20} className="text-gray-500" />
                        </div>
                        <h3 className="text-md font-medium text-white mb-1">No matching refunds</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Try adjusting your search or filters.
                        </p>
                        <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setFilterTab('ALL'); }}>
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    // Refund List
                    <div className="grid gap-3">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-5 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4 md:col-span-3">Customer & Order</div>
                            <div className="col-span-2 hidden md:block">Requested On</div>
                            <div className="col-span-2 hidden md:block">Amount</div>
                            <div className="col-span-3 md:col-span-1 hidden md:block">Method</div>
                            <div className="col-span-3 md:col-span-2">Status</div>
                            <div className="col-span-2 hidden md:block text-right">SLA Deadline</div>
                            <div className="col-span-2 md:col-span-1"></div>
                        </div>

                        {filteredRefunds.map((refund) => {
                            const overdue = isOverdue(refund);
                            const settled = refund.status === "SETTLED";

                            return (
                                <div
                                    key={refund.id}
                                    onClick={() => setSelectedRefund(refund)}
                                    className={`grid grid-cols-12 gap-4 items-center bg-[#0A0A0A] border rounded-xl p-4 transition-all cursor-pointer group relative ${overdue ? 'border-l-4 border-l-red-500 border-y-white/5 border-r-white/5 bg-red-500/5 hover:bg-red-500/10' : 'border-white/5 hover:bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    {/* Customer & Order */}
                                    <div className="col-span-4 md:col-span-3 flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs shrink-0">
                                            {refund.customerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-white truncate">{refund.customerName}</h4>
                                            <p className="text-xs text-gray-500 truncate">{refund.orderId}</p>
                                        </div>
                                    </div>

                                    {/* Requested On (Desktop Only for Space) */}
                                    <div className="col-span-2 hidden md:block text-sm text-gray-400">
                                        {formatDate(refund.createdAt)}
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-3 md:col-span-2">
                                        <p className="font-bold text-white">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}
                                        </p>
                                    </div>

                                    {/* Method */}
                                    <div className="col-span-3 md:col-span-1 hidden md:flex items-center gap-2 text-sm text-gray-400">
                                        {getMethodIcon(refund.paymentMethod)}
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-3 md:col-span-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border inline-flex items-center gap-1 ${refund.status === 'CREATED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                refund.status === 'PROCESSING_AT_BANK' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    refund.status === 'SETTLED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        refund.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {refund.status === 'SETTLED' && <Check size={10} />}
                                            {refund.status === 'FAILED' && <AlertTriangle size={10} />}
                                            {refund.status.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    {/* SLA Deadline */}
                                    <div className="col-span-2 hidden md:flex flex-col items-end justify-center text-right">
                                        {refund.slaDueDate ? (
                                            <>
                                                <span className={`text-sm font-medium ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {new Date(refund.slaDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                                {overdue && (
                                                    <span className="text-[10px] text-red-400 flex items-center gap-1">
                                                        <AlertTriangle size={10} /> Overdue
                                                    </span>
                                                )}
                                                {settled && (
                                                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                                                        On Time
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600">-</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => openTracking(e, refund.id)}
                                            className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-colors"
                                            title="Open Tracking Page"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <CreateRefundModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

                {/* Detail Panel */}
                {selectedRefund && (
                    <RefundDetailsPanel
                        refund={selectedRefund}
                        onClose={() => setSelectedRefund(null)}
                    />
                )}
            </div>
        </div>
    );
}
