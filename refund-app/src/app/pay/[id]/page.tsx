"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { ShieldCheck, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Refund {
    id: string;
    orderId: string;
    amount: number;
    status: string;
    targetUpi?: string;
    merchantId: string;
}

export default function PayPage() {
    const params = useParams();
    const router = useRouter(); // Initialize router
    const id = params.id as string;

    const [refund, setRefund] = useState<Refund | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [upiId, setUpiId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchRefund = async () => {
            try {
                const docRef = doc(db, "refunds", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setRefund({ id: docSnap.id, ...docSnap.data() } as Refund);
                } else {
                    setError("Refund request not found.");
                }
            } catch (err) {
                console.error("Error fetching refund:", err);
                setError("Unable to load refund details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRefund();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!upiId || !refund) return;

        setSubmitting(true);
        try {
            const docRef = doc(db, "refunds", refund.id);
            await updateDoc(docRef, {
                targetUpi: upiId,
                updatedAt: new Date(), // Using client date for simplicity here, ideally serverTimestamp
            });
            setSuccess(true);

            // Redirect after 1.5 seconds to show success message briefly
            setTimeout(() => {
                router.push(`/t/${refund.id}`);
            }, 1500);

        } catch (err) {
            console.error("Error updating UPI:", err);
            alert("Failed to submit details. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center py-12">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Link Invalid</h2>
                    <p className="text-gray-400">{error}</p>
                </Card>
            </div>
        );
    }

    if (!refund) return null;

    // Safety Check: Already Submitted or Settled
    if (refund.status === "SETTLED" || (refund.targetUpi && !success)) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
                </div>

                <Card className="max-w-md w-full text-center py-12 relative z-10 border-green-500/20 bg-green-500/5">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 ring-1 ring-green-500/30">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Submission Received</h2>
                    <p className="text-gray-400 mb-6 px-6">
                        We have already received the payment details for Order
                        <span className="text-white font-medium"> #{refund.orderId}</span>.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full text-sm text-gray-400">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span>Details Securely Stored</span>
                    </div>
                    <div className="mt-8">
                        <Button variant="outline" onClick={() => router.push(`/t/${refund.id}`)}>
                            Track Refund Status
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Trust Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-400 mb-4">
                        <ShieldCheck size={12} />
                        Secure Payment Link
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}
                    </h1>
                    <p className="text-gray-400">Refund for Order #{refund.orderId}</p>
                </div>

                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    {success ? (
                        <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Details Sent!</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Redirecting you to the timeline...
                            </p>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-1/2 animate-[progress_2s_ease-in-out_infinite]" />
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">
                                    Enter UPI ID
                                </label>
                                <Input
                                    placeholder="e.g. mobile@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    required
                                    className="h-12 text-lg bg-black/20 border-white/10 focus:border-blue-500/50"
                                />
                                <p className="text-xs text-gray-500 ml-1">
                                    Funds will be transferred to this account.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500"
                                isLoading={submitting}
                            >
                                <Lock size={16} className="mr-2" />
                                Verify & Submit Securely
                            </Button>
                        </form>
                    )}
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
                        <Lock size={10} />
                        256-bit Encrypted • Powered by Ryyt
                    </p>
                </div>
            </div>
        </div>
    );
}
