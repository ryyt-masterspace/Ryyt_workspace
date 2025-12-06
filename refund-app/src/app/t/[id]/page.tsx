"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, AlertTriangle } from "lucide-react";

export default function TrackingPage() {
    const params = useParams();
    const router = useRouter();
    const [refund, setRefund] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState(false);
    const [brandName, setBrandName] = useState("Ryyt Secure Track");

    useEffect(() => {
        const fetchRefund = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, "refunds", params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // TYPE FIX: Cast as any to avoid build errors
                    const data = docSnap.data() as any;

                    setRefund({ id: docSnap.id, ...data });

                    // Smart Redirect Logic
                    const needsUpi = (['UPI', 'COD', 'WALLET'].includes(data.paymentMethod)) && (!data.targetUpi);

                    if (needsUpi && data.status !== 'FAILED') {
                        setIsRedirecting(true);
                        router.push(`/pay/${docSnap.id}`);
                    }

                    // Fetch Merchant Brand Name
                    if (data.merchantId) {
                        try {
                            const merchantSnap = await getDoc(doc(db, "merchants", data.merchantId));
                            if (merchantSnap.exists() && merchantSnap.data().brandName) {
                                setBrandName(merchantSnap.data().brandName);
                            }
                        } catch (err) {
                            console.error("Error fetching merchant brand:", err);
                        }
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

    if (loading || isRedirecting) return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm animate-pulse">{isRedirecting ? "Verifying requirements..." : "Locating transaction..."}</p>
        </div>
    );

    if (error || !refund) return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-red-500">Refund Not Found</h1>
        </div>
    );

    // Timeline Helper
    const getStepStatus = (stepIndex: number) => {
        const statusMap: any = {
            DRAFT: 0,
            GATHERING_DATA: 0,
            CREATED: 0,
            PROCESSING_AT_BANK: 1,
            SETTLED: 2
        };

        // Fix: If Settled, marking last step as completed
        if (refund.status === 'SETTLED' && stepIndex === 2) return "completed";

        const currentStep = statusMap[refund.status] || 0;
        if (currentStep > stepIndex) return "completed";
        if (currentStep === stepIndex) return "active";
        return "pending";
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 flex justify-center p-4 sm:p-8">
            <div className="w-full max-w-md space-y-8">

                {/* Header */}
                <div className="flex items-center justify-center gap-2 opacity-80">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">
                        {brandName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold tracking-wide text-sm">{brandName}</span>
                </div>

                {/* Hero Card */}
                <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-8 shadow-2xl transition-all duration-500 ${refund.status === 'SETTLED' ? 'shadow-[0_0_50px_rgba(34,197,94,0.1)] border-green-500/20' : ''}`}>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">Total Refund Amount</p>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${refund.status === 'SETTLED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                {refund.status === 'SETTLED' ? 'CREDITED' : 'IN PROGRESS'}
                            </div>
                        </div>

                        <h1 className="text-5xl font-bold tracking-tighter text-white mb-2">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}
                        </h1>

                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Verified for Order #{refund.orderId}
                        </p>
                    </div>
                </div>

                {/* LOGIC GAP FIX: Failure Reason Alert */}
                {refund.status === 'FAILED' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-red-500 font-semibold mb-1">Refund Stopped</h3>
                            <p className="text-red-400/90 text-sm">
                                {refund.failureReason || "The merchant marked this refund as failed. Please contact support."}
                            </p>
                            {!refund.targetUpi && (
                                <p className="text-red-400/70 text-xs mt-2 italic">
                                    (Previous details were cleared. Please allow re-entry.)
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="relative pl-4 pt-4">
                    <div className="absolute left-[27px] top-6 bottom-8 w-0.5 bg-gradient-to-b from-green-500/50 via-gray-800 to-gray-900" />

                    {/* Step 1 */}
                    <TimelineItem
                        status={getStepStatus(0)}
                        title="Refund Initiated"
                        desc={['UPI', 'COD', 'WALLET'].includes(refund.paymentMethod) ? "Payment details received. Preparing transfer." : "Refund authorized. Request sent to gateway."}
                        date={refund.createdAt?.seconds ? new Date(refund.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    />

                    {/* Step 2 */}
                    <TimelineItem
                        status={getStepStatus(1)}
                        title="Processing at Bank"
                        desc="The money is moving through banking rails."
                    />

                    {/* Step 3 */}
                    <TimelineItem
                        status={getStepStatus(2)}
                        title="Credited to Account"
                        desc={refund.targetUpi
                            ? `Credited to ${refund.targetUpi}. UTR: ${refund.proofs?.utr || 'Pending'}`
                            : `Credited to source. ARN: ${refund.proofs?.arn || 'Pending'}`}
                        isLast
                    />
                </div>

                {/* Footer */}
                <div className="text-center pt-8 border-t border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                        Powered by Ryyt Infrastructure
                    </p>
                </div>

            </div>
        </div>
    );
}

function TimelineItem({ status, title, desc, date, isLast }: any) {
    let icon = <div className="w-2 h-2 bg-gray-600 rounded-full" />;
    let borderClass = "border-gray-800 bg-[#050505]";
    let textClass = "text-gray-500";
    let titleClass = "text-gray-500";

    if (status === "completed") {
        icon = <CheckCircle2 className="w-5 h-5 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />;
        borderClass = "border-green-500/20 bg-green-500/5";
        textClass = "text-gray-400";
        titleClass = "text-white";
    } else if (status === "active") {
        icon = <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />;
        borderClass = "border-blue-500/50 bg-blue-500/10";
        textClass = "text-gray-400";
        titleClass = "text-white";
    }

    return (
        <div className="relative flex gap-6 mb-10 last:mb-0">
            <div className={`w-12 h-12 rounded-full border ${borderClass} flex items-center justify-center shrink-0 z-10 transition-all duration-500`}>
                {icon}
            </div>
            <div className="pt-1">
                <h3 className={`font-medium text-lg tracking-tight ${titleClass}`}>{title}</h3>
                <p className="text-sm mt-1 leading-relaxed ${textClass}">{desc}</p>
                {date && <p className="text-xs text-gray-600 mt-2 font-mono">{date}</p>}
            </div>
        </div>
    );
}
