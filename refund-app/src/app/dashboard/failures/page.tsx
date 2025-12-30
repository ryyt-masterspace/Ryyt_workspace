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
import { Plus, XCircle, Search, CheckSquare, Square } from "lucide-react";

interface Refund {
    id: string;
    orderId?: string;
    customerName?: string;
    amount: number;
    paymentMethod?: string;
    status?: string;
    slaDueDate?: string | number | Date;
    merchantId?: string;
    createdAt?: { seconds: number; nanoseconds: number } | Date | null;
}

export default function FailuresPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
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

            // FILTER: Only FAILED
            const failedData = data.filter(r => r.status === 'FAILED');

            setRefunds(failedData);
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

    // Local Search Logic
    const filteredRefunds = refunds.filter(r => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
            (r.orderId || "").toLowerCase().includes(lowerSearch) ||
            (r.customerName || "").toLowerCase().includes(lowerSearch) ||
            (r.amount?.toString() || "").includes(lowerSearch)
        );
    });

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] p-8 bg-[#050505] text-white">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header with Search */}
                    <div className="flex justify-between items-center bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                        {/* Title Section */}
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-500/10 rounded-xl">
                                <XCircle className="text-rose-500 w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-rose-100">Payment Failures</h1>
                                <p className="text-rose-400/70 text-sm">Refunds that were rejected or failed</p>
                            </div>
                        </div>

                        {/* Search & Action Section */}
                        <div className="flex items-center gap-4">
                            {/* Search Input */}
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search failures..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors placeholder:text-gray-600"
                                />
                            </div>

                            {/* New Button */}
                            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200">
                                <Plus size={16} /> New Refund
                            </Button>
                        </div>
                    </div>

                    {/* Table List */}
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
                                            {searchTerm ? (
                                                <span>No failures match &quot;{searchTerm}&quot;</span>
                                            ) : (
                                                <span className="text-green-500">No payment failures found. Good job!</span>
                                            )}
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
                                                    <span className="font-mono text-white group-hover:text-rose-400 transition-colors">#{refund.orderId}</span>
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
                                                    <span className="text-xs text-rose-400 font-medium">Action Required</span>
                                                    <span className="text-[10px] text-zinc-500">
                                                        {(() => {
                                                            const val = refund.createdAt;
                                                            if (!val) return '-';
                                                            const date = ('seconds' in val) ? new Date(val.seconds * 1000) : new Date(val as Date);
                                                            return date.toLocaleDateString();
                                                        })()}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
