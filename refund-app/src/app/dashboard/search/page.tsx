"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import CreateRefundModal from "@/components/dashboard/CreateRefundModal";
import RefundDetailsPanel from "@/components/dashboard/RefundDetailsPanel";
import Sidebar from "@/components/dashboard/Sidebar";
import { Copy, ExternalLink, Plus, Search } from "lucide-react";

export default function SearchPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const router = useRouter();
    const auth = getAuth(app);

    const fetchRefunds = async () => {
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
            })) as any[];

            // Sort: Newest First
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
            if (!currentUser) router.push("/login");
            else setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth, router]);

    useEffect(() => {
        if (user) fetchRefunds();
    }, [user]);

    // FILTER LOGIC: Pure search
    const filteredRefunds = refunds.filter(r => {
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

                    {/* Search Input (Prominent) */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-all shadow-lg"
                        />
                    </div>

                    {/* Results Table */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Results ({filteredRefunds.length})</h2>
                        </div>

                        <div className="space-y-2">
                            {filteredRefunds.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 bg-[#0A0A0A] rounded-xl border border-white/5 border-dashed flex flex-col items-center gap-2">
                                    {searchTerm ? <span>No matches found for "{searchTerm}"</span> : <span>Start typing to search...</span>}
                                </div>
                            ) : (
                                filteredRefunds.map((refund) => (
                                    <div
                                        key={refund.id}
                                        onClick={() => setSelectedRefund(refund)}
                                        className="group bg-[#0A0A0A] hover:bg-[#0F0F0F] border border-white/5 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-white/20 hover:shadow-lg"
                                    >
                                        <div className="flex items-center gap-4 w-1/4">
                                            <div className={`w-2 h-2 rounded-full ${refund.status === 'SETTLED' ? 'bg-green-500' : refund.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <div className="font-mono text-sm text-white group-hover:text-blue-400 transition-colors">#{refund.orderId}</div>
                                                <div className="text-xs text-gray-500">{refund.customerName}</div>
                                            </div>
                                        </div>

                                        <div className="w-1/6 font-mono text-sm text-gray-300">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(refund.amount)}
                                        </div>

                                        <div className="w-1/6">
                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${refund.status === 'SETTLED' ? 'bg-green-500/10 text-green-400' :
                                                    refund.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {refund.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <div className="w-1/6 text-right sm:text-left">
                                            {refund.status === 'SETTLED' ? (
                                                <span className="text-xs text-green-500 font-medium">Completed</span>
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

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(`${window.location.origin}/t/${refund.id}`);
                                                }}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                                                title="Copy Link"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <a
                                                href={`/t/${refund.id}`}
                                                target="_blank"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                                                title="Open Page"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
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
