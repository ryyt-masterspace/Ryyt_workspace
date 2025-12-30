"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import CreateRefundModal from "@/components/dashboard/CreateRefundModal";
import RefundDetailsPanel from "@/components/dashboard/RefundDetailsPanel";
import Sidebar from "@/components/dashboard/Sidebar";
import { Plus, Search, CheckSquare, Square } from "lucide-react";

import { Refund } from "@/types/refund";

export default function SearchPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredRefunds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredRefunds.map(r => r.id));
        }
    };

    const router = useRouter();
    const auth = getAuth(app);

    const fetchRefunds = useCallback(async () => {
        if (!auth.currentUser) return;
        try {
            const q = query(
                collection(db, "refunds"),
                where("merchantId", "==", auth.currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Refund[];

            // Sort: Newest First
            data.sort((a, b) => {
                const getTime = (val: { seconds: number; nanoseconds: number } | Date | null | undefined) => {
                    if (!val) return 0;
                    if ('seconds' in val) return val.seconds * 1000;
                    return new Date(val as Date).getTime();
                };
                return getTime(b.createdAt) - getTime(a.createdAt);
            });

            setRefunds(data);
        } catch (error) {
            console.error("Error fetching refunds:", error);
        }
    }, [auth.currentUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) router.push("/login");
            else setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth, router]);

    useEffect(() => {
        if (user) {
            Promise.resolve().then(() => fetchRefunds());
        }
    }, [user, fetchRefunds]);

    // FILTER LOGIC: Pure search + Status
    const filteredRefunds = refunds.filter(r => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch = (
            (r.orderId || "").toLowerCase().includes(lowerSearch) ||
            (r.customerName || "").toLowerCase().includes(lowerSearch) ||
            (r.customerEmail || "").toLowerCase().includes(lowerSearch) ||
            (r.targetUpi || "").toLowerCase().includes(lowerSearch) ||
            (r.amount?.toString() || "").includes(lowerSearch)
        );

        const matchesStatus = statusFilter === "ALL" || (r.status || "").toString().toUpperCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });


    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] p-8 bg-[#050505] text-white">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Global Search</h1>
                            <p className="text-gray-500 text-sm">Find any refund by Order ID, Name, or Amount</p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200">
                            <Plus size={16} /> New Refund
                        </Button>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search Order ID, Email, Name, or UPI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-all shadow-lg"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-sm text-gray-400 focus:outline-none focus:border-white/30 transition-all shadow-lg min-w-[160px]"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="GATHERING_DATA">Gathering Data</option>
                            <option value="REFUND_INITIATED">Initiated</option>
                            <option value="PROCESSING_AT_BANK">Processing</option>
                            <option value="SETTLED">Settled</option>
                            <option value="FAILED">Failed</option>
                            <option value="VOIDED">Voided</option>
                        </select>
                    </div>

                    {/* Results Table */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Results ({filteredRefunds.length})</h2>
                        </div>

                        <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-950/80 border-b border-zinc-800 sticky top-0 z-20 backdrop-blur-md">
                                    <tr>
                                        <th className="w-12 py-4 px-4 text-center">
                                            <button onClick={toggleAll} className="hover:text-white transition-colors text-zinc-500">
                                                {selectedIds.length > 0 && selectedIds.length === filteredRefunds.length ? (
                                                    <CheckSquare size={16} className="text-blue-500" />
                                                ) : (
                                                    <Square size={16} />
                                                )}
                                            </button>
                                        </th>
                                        <th className="py-4 px-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Refund Details</th>
                                        <th className="py-4 px-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Method</th>
                                        <th className="py-4 px-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
                                        <th className="py-4 px-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Timeline</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRefunds.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
                                                {searchTerm ? <span>No matches found for &quot;{searchTerm}&quot;</span> : <span>Start typing to search...</span>}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRefunds.map((refund) => (
                                            <tr
                                                key={refund.id}
                                                onClick={() => setSelectedRefund(refund)}
                                                className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                                            >
                                                <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={(e) => toggleSelection(refund.id, e)} className="hover:text-white transition-colors text-zinc-500">
                                                        {selectedIds.includes(refund.id) ? (
                                                            <CheckSquare size={16} className="text-blue-500" />
                                                        ) : (
                                                            <Square size={16} />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-white group-hover:text-blue-400 transition-colors">#{refund.orderId}</span>
                                                        <span className="text-xs text-zinc-500">{refund.customerName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-[10px] font-medium text-zinc-400 uppercase tracking-wide">
                                                        {refund.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="font-mono font-medium text-emerald-400">
                                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(refund.amount)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    {(() => {
                                                        // 1. Normalize the status string
                                                        const rawStatus = (refund.status || '').toString().toUpperCase();

                                                        // 2. Define Styles & Labels
                                                        let label = rawStatus.replace(/_/g, ' ');
                                                        let style = 'bg-zinc-800 text-zinc-400 border-zinc-700'; // Fallback

                                                        if (rawStatus.includes('GATHER')) {
                                                            label = 'GATHERING DATA';
                                                            style = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
                                                        }
                                                        else if (rawStatus === 'CREATED' || rawStatus.includes('INITIATED')) {
                                                            label = 'REFUND INITIATED';
                                                            style = 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
                                                        }
                                                        else if (rawStatus.includes('PROCESS')) {
                                                            label = 'PROCESSING AT BANK';
                                                            style = 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
                                                        }
                                                        else if (rawStatus.includes('SETTLED') || rawStatus.includes('CREDIT')) {
                                                            label = 'SETTLED';
                                                            style = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
                                                        }
                                                        else if (rawStatus.includes('FAIL')) {
                                                            label = 'FAILED';
                                                            style = 'bg-red-500/10 text-red-500 border border-red-500/20';
                                                        }

                                                        return (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${style}`}>
                                                                {label}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        {refund.status === 'SETTLED' ? (
                                                            <span className="text-xs text-green-500 font-medium">Completed</span>
                                                        ) : refund.status === 'FAILED' ? (
                                                            <span className="text-xs text-red-500 font-medium">Failed</span>
                                                        ) : refund.slaDueDate ? (
                                                            (() => {
                                                                const daysLeft = Math.ceil((new Date(refund.slaDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                                const isOverdue = daysLeft < 0;
                                                                return (
                                                                    <span className={`text-xs font-medium ${isOverdue ? 'text-red-400' : daysLeft <= 2 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                                        {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                                                    </span>
                                                                );
                                                            })()
                                                        ) : <span className="text-xs text-gray-600">-</span>}
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
                        onUpdate={fetchRefunds}
                    />
                )}
            </main>
        </div>
    );
}
