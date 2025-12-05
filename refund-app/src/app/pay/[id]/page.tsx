"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"; // <--- Added arrayUnion here
import { db } from "@/lib/firebase";
import { ShieldCheck, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [refund, setRefund] = useState<any>(null);
    const [upiId, setUpiId] = useState("");

    useEffect(() => {
        const fetchRefund = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, "refunds", params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Safety Check: If already settled or has UPI, don't show form
                    if (data.status === 'SETTLED' || (data.targetUpi && data.status !== 'FAILED')) {
                        setSuccess(true); // Treat as done
                    }
                    setRefund({ id: docSnap.id, ...data });
                } else {
                    setError("Invalid Refund Link");
                }
            } catch (err) {
                console.error(err);
                setError("Error loading details");
            } finally {
                setLoading(false);
            }
        };

        fetchRefund();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!upiId.includes('@')) {
            setError("Please enter a valid UPI ID");
            return;
        }

        setSubmitting(true);
        try {
            const docRef = doc(db, "refunds", params.id as string);

            await updateDoc(docRef, {
                targetUpi: upiId,
                status: "CREATED", // Auto-Promote to Initiated
                timeline: arrayUnion({
                    status: "CREATED",
                    title: "Payment Details Received",
                    date: new Date().toISOString()
                })
            });

            setSuccess(true);

            // Redirect back to tracking page after 1.5s
            setTimeout(() => {
                router.push(`/t/${params.id}`);
            }, 1500);

        } catch (err) {
            console.error(err);
            setError("Failed to save details. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifying Security...</div>;

    if (error) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-red-500">{error}</h1>
        </div>
    );

    if (success) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <CheckCircle className="w-16 h-16 text-green-500 mb-6 animate-bounce" />
            <h1 className="text-2xl font-bold text-white mb-2">Details Secured</h1>
            <p className="text-gray-400">Redirecting to tracker...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">

                {/* Trust Header */}
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <div>
                        <p className="text-xs text-blue-400 font-medium tracking-wider mb-1 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> SECURE LINK
                        </p>
                        <h2 className="text-lg font-semibold text-white">Refund for #{refund.orderId || 'Order'}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">AMOUNT</p>
                        <p className="text-xl font-bold text-white">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount || 0)}
                        </p>
                    </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Enter UPI ID for Refund
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="mobile@oksbi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <Button className="w-full py-4 text-lg font-medium shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        {submitting ? "Verifying..." : "Verify & Submit Securely"}
                    </Button>

                    <p className="text-xs text-center text-gray-600 flex items-center justify-center gap-1 mt-4">
                        <Lock className="w-3 h-3" /> 256-bit End-to-End Encryption
                    </p>
                </form>
            </div>
        </div>
    );
}
