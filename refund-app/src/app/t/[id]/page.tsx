"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, Clock, Building2, AlertCircle, Loader2 } from "lucide-react";

// Mapping status to user-friendly labels (The Language of Trust)
const STATUS_LABELS: any = {
    CREATED: "Refund Initiated",
    PROCESSING_AT_BANK: "Sent to Bank",
    SETTLED: "Credited to Account",
    FAILED: "Action Required",
};

export default function TrackingPage() {
    const params = useParams();
    const router = useRouter();
    const [refund, setRefund] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const fetchRefund = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, "refunds", params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setRefund(data);

                    // --- SMART REDIRECTION LOGIC ---
                    const needsUpi = (['UPI', 'COD', 'WALLET'].includes(data.paymentMethod)) && (!data.targetUpi);

                    if (needsUpi) {
                        setIsRedirecting(true);
                        router.push(`/pay/${data.id}`);
                        return; // Stop further processing
                    }

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
    }, [params.id, router]);

    // Combined Loading & Redirecting State
    if (loading || isRedirecting) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 animate-pulse">
                {isRedirecting ? "Redirecting to secure gateway..." : "Checking status..."}
            </p>
        </div>
    );

    if (error || !refund) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold">Refund Not Found</h1>
            <p className="text-gray-400 mt-2">This link might be invalid or expired.</p>
        </div>
    );

    // --- STANDARD TIMELINE VIEW ---
    // Only reachable if NO redirection happened

    // Timeline Helper Logic
    const getStepStatus = (stepIndex: number) => {
        // Map status to step index
        const statusMap: any = {
            CREATED: 0,
            GATHERING_DATA: 0, // Treats gathering as step 0 phase
            PROCESSING_AT_BANK: 1,
            SETTLED: 2
        };

        const currentStep = statusMap[refund.status] || 0;

        // CRITICAL FIX: If status is SETTLED (2), the last step (2) is COMPLETED, not Active.
        if (refund.status === 'SETTLED' && stepIndex === 2) return "completed";

        if (currentStep > stepIndex) return "completed";
        if (currentStep === stepIndex) return "active";
        return "pending";
    };

    // --- SMART COPY LOGIC ---
    const isManualPayout = ['UPI', 'COD', 'WALLET'].includes(refund.paymentMethod);

    // Step 1 Copy
    const step1Desc = isManualPayout
        ? "Payment details received. Preparing for bank transfer."
        : "Refund authorized. Sending request to gateway.";

    // Step 3 Copy
    const step3Desc = refund.targetUpi
        ? `Credited to ${refund.targetUpi}. UTR: ${refund.proofs?.utr || 'Pending'}`
        : `Credited to original source. ARN: ${refund.proofs?.arn || 'Pending'}`;


    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30 flex flex-col items-center">
            <Navbar />

            <main className="w-full max-w-md p-6 mt-4">
                {/* HERO CARD (The Wallet) */}
                <div className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-8 mb-12 transition-all duration-500 ${refund.status === 'SETTLED' ? 'shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]' : 'shadow-2xl'}`}>

                    {/* Status Pill - Top Right */}
                    <div className="absolute top-6 right-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${refund.status === 'SETTLED'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-white/5 text-gray-400 border-white/10'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${refund.status === 'SETTLED' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                            {STATUS_LABELS[refund.status] || refund.status.replace(/_/g, " ")}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                        <p className="text-gray-500 text-xs font-medium tracking-widest uppercase">Refund Amount</p>
                        <h1 className="text-5xl font-bold tracking-tighter text-white">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(refund.amount)}
                        </h1>
                    </div>

                    {/* Decorative Bottom Glow */}
                    {refund.status === 'SETTLED' && (
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-green-500/20 blur-[60px] pointer-events-none" />
                    )}
                </div>

                {/* TIMELINE (The Journey) */}
                <div className="relative pl-4 pr-2">
                    {/* Continuous Line Background */}
                    <div className="absolute left-[27px] top-4 bottom-10 w-[2px] bg-gradient-to-b from-green-500/50 to-gray-800/30 rounded-full" />

                    <div className="space-y-10">
                        {/* Step 1: Initiated */}
                        <TimelineItem
                            status={getStepStatus(0)}
                            title="Refund Initiated"
                            desc={step1Desc}
                            date={refund.createdAt?.seconds ? new Date(refund.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Just now'}
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
                            desc={step3Desc}
                            isLast
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 flex flex-col items-center gap-3 opacity-40">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Building2 className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase text-center">
                        SECURE PAYMENT • RYYT PAYMENTS
                    </p>
                </div>
            </main>
        </div>
    );
}

function Navbar() {
    return (
        <nav className="w-full flex justify-center py-6">
            <div className="flex items-center gap-2.5 opacity-80">
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-sm" />
                </div>
                <span className="font-medium text-sm tracking-tight text-gray-200">Ryyt Secure Track</span>
            </div>
        </nav>
    );
}

// Sub-component for Timeline Steps
function TimelineItem({ status, title, desc, date, isLast }: any) {
    const isCompleted = status === "completed";
    const isActive = status === "active";

    return (
        <div className="relative flex gap-6 group">
            {/* The Node */}
            <div className={`
                relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all duration-500
                ${isCompleted ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-110' : ''}
                ${isActive ? 'bg-gray-900 border border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : ''}
                ${!isCompleted && !isActive ? 'bg-gray-900 border border-gray-800' : ''}
            `}>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3]" />}
                {isActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            </div>

            {/* The Content */}
            <div className={`flex-1 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-60 group-hover:opacity-90'}`}>
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-base font-semibold tracking-tight ${isCompleted || isActive ? 'text-gray-100' : 'text-gray-500'}`}>
                        {title}
                    </h3>
                    {date && <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">{date}</span>}
                </div>
                <p className="text-sm text-gray-400 font-light leading-relaxed max-w-[90%]">
                    {desc}
                </p>

                {/* Visual Connector for Active State */}
                {isActive && (
                    <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-medium text-green-500/80 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        IN PROGRESS
                    </div>
                )}
            </div>
        </div>
    );
}
