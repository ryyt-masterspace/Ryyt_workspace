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
import { Copy, ExternalLink, Plus, CheckCircle2, Search, ArrowUpRight } from "lucide-react";

export default function SettledRefundsPage() {
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
                where("merchantId", "==", auth.currentUser.uid),
                where("status", "==", "SETTLED") // Only Settled
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

    // Local Filter Logic
    const filteredRefunds = refunds.filter(r => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
            (r.orderId || "").toLowerCase().includes(lowerSearch) ||
            (r.customerName || "").toLowerCase().includes(lowerSearch) ||
            (r.amount?.toString() || "").includes(lowerSearch) ||
            (r.proofs?.utr || "").toLowerCase().includes(lowerSearch) // Search by UTR
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
                    <div className="flex justify-between items-center bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <CheckCircle2 className="text-green-500 w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Settled & Closed</h1>
                                <p className="text-gray-500 text-sm">Successfully completed transactions</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search settled refunds..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors placeholder:text-gray-600"
                                />
                            </div>
                            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200">
                                <Plus size={16} /> New Refund
                            </Button>
                        </div>
                    </div>

                    {/* Table List */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {filteredRefunds.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 bg-[#0A0A0A] rounded-xl border border-white/5 border-dashed">
                                    {searchTerm ? <span>No settled refunds match "{searchTerm}"</span> : <span>No settled refunds found yet.</span>}
                                </div>
                            ) : (
                                filteredRefunds.map((refund) => (
                                    <div
                                        key={refund.id}
                                        onClick={() => setSelectedRefund(refund)}
                                        className="group bg-[#0A0A0A] hover:bg-[#0F0F0F] border border-white/5 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-green-500/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.05)]"
                                    >
                                        <div className="flex items-center gap-4 w-1/4">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <div>
                                                <div className="font-mono text-sm text-white group-hover:text-green-400 transition-colors">#{refund.orderId}</div>
                                                <div className="text-xs text-gray-500">{refund.customerName}</div>
                                            </div>
                                        </div>

                                        <div className="w-1/6 font-mono text-sm text-gray-300">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(refund.amount)}
                                        </div>

                                        {/* UTR / Proof Column */}
                                        <div className="w-1/4 flex flex-col justify-center">
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wide">UTR / Ref</div>
                                            <div className="text-sm font-mono text-green-300/80 flex items-center gap-1">
                                                <ArrowUpRight className="w-3 h-3" />
                                                {refund.proofs?.utr || refund.proofs?.arn || "N/A"}
                                            </div>
                                        </div>

                                        <div className="w-1/6 text-right sm:text-left">
                                            <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase bg-green-500/10 text-green-400">
                                                SETTLED
                                            </span>
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
