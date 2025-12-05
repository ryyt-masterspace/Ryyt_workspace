"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CreateRefundModal from "@/components/dashboard/CreateRefundModal";
import RefundDetailsPanel from "@/components/dashboard/RefundDetailsPanel";
import { LogOut, Plus, Search, ExternalLink, AlertTriangle, TrendingUp, Activity, Copy } from "lucide-react";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<any>(null);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTab, setFilterTab] = useState<'ALL' | 'ACTION' | 'OVERDUE' | 'SETTLED'>('ALL');

    const router = useRouter();
    const auth = getAuth(app);

    // 1. Define Fetch Logic (Hoisted)
    const fetchRefunds = async () => {
        if (!auth.currentUser) return;
        try {
            // Fetch WITHOUT sorting first (Client-side sort later)
            const q = query(
                collection(db, "refunds"),
                where("merchantId", "==", auth.currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[];

            // Client-side Sort: Newest First
            data.sort((a, b) => {
                const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
                const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });

            setRefunds(data);
        } catch (error) {
            console.error("Error fetching refunds:", error);
        }
    };

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

    // Trigger fetch when user is ready
    useEffect(() => {
        if (user) {
            fetchRefunds();
        }
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    // 2. Compute Stats
    const activeCount = refunds.filter(r => r.status !== 'SETTLED').length;
    const breachCount = refunds.filter(r => {
        if (r.status === 'SETTLED' || !r.slaDueDate) return false;
        return new Date() > new Date(r.slaDueDate);
    }).length;

    const riskValue = refunds.reduce((acc, r) => {
        if (r.status !== 'SETTLED' && r.slaDueDate && new Date() > new Date(r.slaDueDate)) {
            return acc + (Number(r.amount) || 0);
        }
        return acc;
    }, 0);

    // 3. Filter Logic
    const filteredRefunds = refunds.filter(r => {
        // Search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (r.orderId || "").toLowerCase().includes(searchLower) ||
            (r.customerName || "").toLowerCase().includes(searchLower) ||
            (r.amount?.toString() || "").includes(searchLower);

        if (!matchesSearch) return false;

        // Tabs
        if (filterTab === 'ALL') return true;
        if (filterTab === 'SETTLED') return r.status === 'SETTLED';
        if (filterTab === 'ACTION') return ['DRAFT', 'GATHERING_DATA', 'FAILED'].includes(r.status) || (!r.paymentMethod);
        if (filterTab === 'OVERDUE') {
            return r.status !== 'SETTLED' && r.slaDueDate && new Date() > new Date(r.slaDueDate);
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-gray-400 text-sm">Welcome back, {user.email}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                            <Plus size={18} /> New Refund
                        </Button>
                        <Button variant="ghost" onClick={handleLogout} className="text-gray-400 hover:text-white">
                            <LogOut size={20} />
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-3xl font-bold">{activeCount}</span>
                        </div>
                        <p className="text-sm text-gray-400">Active Refunds</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <span className="text-3xl font-bold text-red-400">{breachCount}</span>
                        </div>
                        <p className="text-sm text-gray-400">SLA Breaches</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="text-3xl font-bold">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(riskValue)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">Value at Risk</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex gap-2">
                        {['ALL', 'ACTION', 'OVERDUE', 'SETTLED'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilterTab(tab as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterTab === tab ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {tab === 'ACTION' ? 'Attn Needed' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search order, name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider bg-black/20">
                                    <th className="p-4 font-medium">Order Details</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Status & Method</th>
                                    <th className="p-4 font-medium">Due Date</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredRefunds.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No refunds found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRefunds.map((refund) => (
                                        <tr
                                            key={refund.id}
                                            onClick={() => setSelectedRefund(refund)}
                                            className="group hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">#{refund.orderId}</span>
                                                    <span className="text-xs text-gray-500">{refund.customerName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-sm text-gray-300">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex self-start px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${refund.status === 'SETTLED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            refund.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                refund.status === 'GATHERING_DATA' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        {refund.status.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest pl-0.5">
                                                        {refund.paymentMethod?.replace('_', ' ') || 'unspecified'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {refund.slaDueDate ? (
                                                    (() => {
                                                        const daysLeft = Math.ceil((new Date(refund.slaDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                        const isOverdue = daysLeft < 0;
                                                        if (refund.status === 'SETTLED') return <span className="text-xs text-gray-500">Settled</span>;

                                                        return (
                                                            <div className={`text-xs font-medium ${isOverdue ? 'text-red-400' : daysLeft <= 2 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                                {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                                                            </div>
                                                        );
                                                    })()
                                                ) : <span className="text-xs text-gray-600">-</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(`${window.location.origin}/t/${refund.id}`);
                                                        }}
                                                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                                                        title="Copy Customer Link"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <a
                                                        href={`/t/${refund.id}`}
                                                        target="_blank"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <CreateRefundModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchRefunds();
                }}
            />

            {selectedRefund && (
                <RefundDetailsPanel
                    refund={selectedRefund}
                    onClose={() => setSelectedRefund(null)}
                    onUpdate={fetchRefunds} // <--- PASSED CORRECTLY NOW
                />
            )}
        </div>
    );
}
