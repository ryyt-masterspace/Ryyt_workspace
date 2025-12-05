"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, Clock, Building2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

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

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !refund) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold">Refund Not Found</h1>
            <p className="text-gray-400 mt-2">This link might be invalid or expired.</p>
        </div>
    );

    // --- SMART LINK LOGIC ---

    // Condition: If Gathering Data (or Draft), hijack the view
    if (refund.status === 'GATHERING_DATA' || refund.status === 'DRAFT') {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 flex flex-col">
                <Navbar />

                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
                    {/* Visual Icon */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800 to-black border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                            <ShieldCheck size={32} className="text-blue-500" />
                        </div>
                        {/* Notify Badge */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-4 border-black flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Action Required</h1>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
                        We need a few details to process your refund of <span className="text-white font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}</span> efficiently.
                    </p>

                    <Link href={`/pay/${refund.id}`} className="w-full">
                        <Button className="w-full h-12 text-base shadow-blue-500/20 shadow-lg">
                            Enter Payment Details Securely
                            <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </Link>

                    <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4 opacity-50 grayscale" />
                        <span>Secured by Ryyt</span>
                    </div>
                </main>
            </div>
        );
    }

    // --- STANDARD TIMELINE VIEW ---

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
            <Navbar />

            <main className="max-w-md mx-auto p-6">
                {/* HERO CARD */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">Total Refund Amount</p>
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        {STATUS_LABELS[refund.status] || refund.status.replace(/_/g, " ")}
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

function Navbar() {
    return (
        <nav className="border-b border-white/10 p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-md mx-auto flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">R</div>
                <span className="font-semibold text-sm tracking-tight">Ryyt Secure Track</span>
            </div>
        </nav>
    );
}

// Sub-component for Timeline Steps
function TimelineItem({ status, title, desc, date, isLast }: any) {
    let icon = <div className="w-2 h-2 bg-gray-600 rounded-full" />;
    let colorClass = "text-gray-500";
    let borderClass = "border-gray-800 bg-gray-900";

    if (status === "completed") {
        icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
        colorClass = "text-green-500";
        borderClass = "border-green-500/30 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
    } else if (status === "active") {
        icon = <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />;
        colorClass = "text-blue-400";
        borderClass = "border-blue-500/50 bg-blue-500/10";
    }

    return (
        <div className="relative flex gap-5 group">
            <div className={`w-10 h-10 rounded-full border ${borderClass} flex items-center justify-center shrink-0 z-10 transition-all duration-500`}>
                {icon}
            </div>
            <div className="pb-2 pt-1">
                <h3 className={`font-medium text-sm ${status === 'pending' ? 'text-gray-500' : 'text-white'}`}>{title}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
                {date && <p className="text-[10px] text-gray-600 mt-2 font-mono uppercase">{date}</p>}
            </div>
        </div>
    );
}
