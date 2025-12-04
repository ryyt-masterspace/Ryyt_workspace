"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Button from "@/components/ui/Button";
import CreateRefundModal from "@/components/dashboard/CreateRefundModal";
import { Plus, LogOut, Search } from "lucide-react";

interface Refund {
    id: string;
    orderId: string;
    customerName: string;
    amount: number;
    status: string;
    createdAt: any;
}

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingRefunds, setIsLoadingRefunds] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            // Real-time listener for refunds
            const q = query(
                collection(db, "refunds"),
                where("merchantId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const refundList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Refund[];
                setRefunds(refundList);
                setIsLoadingRefunds(false);
            });

            return () => unsubscribe();
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
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

                {/* Content */}
                {isLoadingRefunds ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : refunds.length === 0 ? (
                    // Empty State
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
                ) : (
                    // Refund List
                    <div className="grid gap-4">
                        {refunds.map((refund) => (
                            <div
                                key={refund.id}
                                className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                                        {refund.customerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-white">{refund.customerName}</h4>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-400">{refund.orderId}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${refund.status === 'CREATED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    refund.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                {refund.status}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {refund.createdAt?.toDate().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500">Refund Amount</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm">View Details</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <CreateRefundModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        </div>
    );
}
