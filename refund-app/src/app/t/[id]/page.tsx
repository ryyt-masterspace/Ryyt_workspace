"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, Clock, Building2, AlertCircle } from "lucide-react";
import Link from "next/link";

// Mapping status to user-friendly labels (The Language of Trust)
const STATUS_LABELS: any = {
    CREATED: "Refund Initiated",
    PROCESSING_AT_BANK: "Sent to Bank",
    SETTLED: "Credited to Account",
    FAILED: "Action Required",
};

export default function TrackingPage() {
    const params = useParams();
    const [refund, setRefund] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRefund = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, "refunds", params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setRefund({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchRefund();
    }, [params.id]);

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Refund Details...</div>;

    if (error || !refund) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold">Refund Not Found</h1>
            <p className="text-gray-400 mt-2">This link might be invalid or expired.</p>
        </div>
    );

    // Timeline Helper Logic
    const getStepStatus = (stepIndex: number) => {
        const statusMap = { CREATED: 0, PROCESSING_AT_BANK: 1, SETTLED: 2 };
        const currentStep = statusMap[refund.status as keyof typeof statusMap] || 0;

        if (currentStep > stepIndex) return "completed";
        if (currentStep === stepIndex) return "active";
        return "pending";
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            {/* Navbar Minimal */}
            <nav className="border-b border-white/10 p-4">
                <div className="max-w-md mx-auto flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">R</div>
                    <span className="font-semibold">Ryyt Secure Track</span>
                </div>
            </nav>

            <main className="max-w-md mx-auto p-6">
                {/* HERO CARD */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Refund Amount</p>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                        <Clock className="w-4 h-4" />
                        {STATUS_LABELS[refund.status] || refund.status}
                    </div>
                </div>

                {/* TIMELINE */}
                <div className="space-y-8 relative pl-2">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-800" />

                    {/* Step 1: Initiated */}
                    <TimelineItem
                        status={getStepStatus(0)}
                        title="Refund Initiated"
                        desc={`Authorized for Order #${refund.orderId}`}
                        date={refund.createdAt?.seconds ? new Date(refund.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    />

                    {/* Step 2: Bank Processing */}
                    <TimelineItem
                        status={getStepStatus(1)}
                        title="Processing at Bank"
                        desc="The money is moving through banking rails."
                    />

                    {/* Step 3: Settled */}
                    <TimelineItem
                        status={getStepStatus(2)}
                        title="Credited to Account"
                        desc={refund.proofs?.utr ? `UTR: ${refund.proofs.utr}` : "Funds should reflect in your account."}
                        isLast
                    />
                </div>

                {/* Footer Trust Signal */}
                <div className="mt-12 text-center border-t border-white/5 pt-6">
                    <p className="text-xs text-gray-500">
                        Securely processed by Ryyt.
                        <br />Updates are tracked in real-time.
                    </p>
                </div>
            </main>
        </div>
    );
}

// Sub-component for Timeline Steps
function TimelineItem({ status, title, desc, date, isLast }: any) {
    let icon = <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    let colorClass = "text-gray-500";
    let borderClass = "border-gray-700 bg-gray-900";

    if (status === "completed") {
        icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
        colorClass = "text-green-500";
        borderClass = "border-green-500/30 bg-green-500/10";
    } else if (status === "active") {
        icon = <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />;
        colorClass = "text-blue-400";
        borderClass = "border-blue-500 bg-blue-500/10";
    }

    return (
        <div className="relative flex gap-4">
            <div className={`w-10 h-10 rounded-full border ${borderClass} flex items-center justify-center shrink-0 z-10`}>
                {icon}
            </div>
            <div className="pb-2">
                <h3 className={`font-medium ${status === 'pending' ? 'text-gray-500' : 'text-white'}`}>{title}</h3>
                <p className="text-sm text-gray-400 mt-1">{desc}</p>
                {date && <p className="text-xs text-gray-600 mt-1">{date}</p>}
            </div>
        </div>
    );
}
