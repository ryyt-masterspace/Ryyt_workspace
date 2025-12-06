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
import { Copy, ExternalLink, Plus, AlertTriangle } from "lucide-react";

export default function SLABreachesPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<any>(null);

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

            // FILTER: Compliance Breaches (Overdue & Not Settled)
            const breachData = data.filter(r => {
                if (r.status === 'SETTLED' || !r.slaDueDate) return false;
                return new Date() > new Date(r.slaDueDate);
            });

            setRefunds(breachData);
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

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] p-8 bg-[#050505] text-white">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/10 rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-red-500/20 blur-xl"></div>
                                <AlertTriangle className="text-red-500 w-6 h-6 relative z-10" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-red-100">Compliance Breaches</h1>
                                <p className="text-red-400/70 text-sm">Overdue refunds requiring immediate attention</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200">
                            <Plus size={16} /> New Refund
                        </Button>
                    </div>

                    {/* Table List */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {refunds.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 bg-[#0A0A0A] rounded-xl border border-white/5 border-dashed flex flex-col items-center gap-2">
                                    <span className="text-green-500 font-medium">No breaches found!</span>
                                    <span className="text-xs">Your compliance is perfect.</span>
                                </div>
                            ) : (
                                refunds.map((refund) => (
                                    <div
                                        key={refund.id}
                                        onClick={() => setSelectedRefund(refund)}
                                        className="group bg-[#0A0A0A] hover:bg-[#0F0F0F] border border-red-500/20 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4 w-1/4">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                            <div>
                                                <div className="font-mono text-sm text-white group-hover:text-red-400 transition-colors">#{refund.orderId}</div>
                                                <div className="text-xs text-gray-500">{refund.customerName}</div>
                                            </div>
                                        </div>

                                        <div className="w-1/6 font-mono text-sm text-gray-300">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(refund.amount)}
                                        </div>

                                        <div className="w-1/6">
                                            <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase bg-red-500/10 text-red-500 border border-red-500/20">
                                                {refund.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <div className="w-1/6 text-right sm:text-left">
                                            {(() => {
                                                const daysLeft = Math.ceil((new Date(refund.slaDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                return (
                                                    <span className="text-xs font-bold text-red-500">
                                                        {Math.abs(daysLeft)} days overdue
                                                    </span>
                                                );
                                            })()
                                            }
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
