"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldCheck, Lock, CheckCircle, AlertTriangle, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { isFeatureEnabled } from "@/config/features";
import { sendUpdate, NotificationRefundData } from "@/lib/notificationService";
import Image from "next/image";

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [refund, setRefund] = useState<DocumentData | null>(null);
    const [upiId, setUpiId] = useState("");
    const [brandName, setBrandName] = useState("Merchant");
    const [brandLogo, setBrandLogo] = useState<string | null>(null);

    // Phase 2: Security Guard State
    const [isVerified, setIsVerified] = useState(false);
    const [userInputEmail, setUserInputEmail] = useState("");
    const [verificationError, setVerificationError] = useState("");

    const isSecureLinkEnabled = isFeatureEnabled("ENABLE_SECURE_PAY_LINK");

    useEffect(() => {
        const fetchRefund = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, "refunds", params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status === 'SETTLED' || (data.targetUpi && data.status !== 'FAILED')) {
                        setSuccess(true);
                    }
                    setRefund({ id: docSnap.id, ...data });

                    // Fetch Merchant Brand Name
                    if (data.merchantId) {
                        try {
                            const merchantSnap = await getDoc(doc(db, "merchants", data.merchantId));
                            if (merchantSnap.exists()) {
                                const mData = merchantSnap.data();
                                if (mData.brandName) setBrandName(mData.brandName);
                                if (mData.logo) setBrandLogo(mData.logo);
                            }
                        } catch (err: unknown) {
                            console.error("Error fetching merchant brand:", err);
                        }
                    }
                } else {
                    setError("Invalid Refund Link");
                }
            } catch (err: unknown) {
                console.error(err);
                setError("Error loading details");
            } finally {
                setLoading(false);
            }
        };

        fetchRefund();
    }, [params.id]);

    const maskEmail = (email: string) => {
        if (!email) return "";
        const [name, domain] = email.split("@");
        if (name.length <= 2) return `${name}***@${domain}`;
        return `${name.substring(0, 2)}***@${domain}`;
    };

    const handleVerifyEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInputEmail.toLowerCase().trim() === refund?.customerEmail?.toLowerCase().trim()) {
            setIsVerified(true);
            setVerificationError("");
        } else {
            setVerificationError("Email address does not match our records.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValidUPI = /^[\w.-]+@[\w.-]+$/.test(upiId);

        if (!isValidUPI) {
            setError("Please enter a valid UPI ID (e.g., name@bank)");
            return;
        }

        setSubmitting(true);
        try {
            const docRef = doc(db, "refunds", params.id as string);

            await updateDoc(docRef, {
                targetUpi: upiId,
                status: "REFUND_INITIATED",
                timeline: arrayUnion({
                    status: "REFUND_INITIATED",
                    title: "Payment Details Received",
                    date: new Date().toISOString()
                })
            });

            setSuccess(true);

            // --- EMAIL TRIGGER START (Phase 5/QA Sync) ---
            if (refund) {
                await sendUpdate(refund.merchantId, { id: params.id as string, ...refund } as NotificationRefundData, 'REFUND_INITIATED');
            }
            // ---------------------------------------------

            setTimeout(() => {
                router.push(`/t/${params.id}`);
            }, 1500);

        } catch {
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

    // Identity Verification Screen (Phase 2)
    if (isSecureLinkEnabled && !isVerified) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                            <ShieldCheck className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Identity Check</h2>
                        <p className="text-sm text-gray-500 mt-2">
                            To protect your data, please verify your email address.
                        </p>
                    </div>

                    <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Verification Hint</p>
                            <p className="text-lg font-mono text-blue-400">{maskEmail(refund?.customerEmail)}</p>
                        </div>
                    </div>

                    <form onSubmit={handleVerifyEmail} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm your full email</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={userInputEmail}
                                onChange={(e) => {
                                    setUserInputEmail(e.target.value);
                                    setVerificationError("");
                                }}
                                className={`w-full bg-black/50 border ${verificationError ? 'border-red-500/50' : 'border-white/10'} rounded-lg py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all`}
                                required
                            />
                            {verificationError && (
                                <p className="text-xs text-red-500 mt-2 font-medium">{verificationError}</p>
                            )}
                        </div>
                        <Button className="w-full py-4 text-lg font-medium shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            Unlock Payment Form
                        </Button>
                        <p className="text-xs text-center text-gray-600 flex items-center justify-center gap-1 mt-4 italic">
                            Verification required for high-risk payouts.
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8 border-b border-white/10 pb-6 w-full">
                    {brandLogo ? (
                        <div className="relative h-10 w-auto max-w-[160px] mb-4">
                            <Image
                                src={brandLogo}
                                alt={brandName}
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                            {brandName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="text-center">
                        <p className="text-[10px] text-blue-400 font-bold tracking-[0.2em] mb-1 flex items-center justify-center gap-1 uppercase">
                            <ShieldCheck className="w-3 h-3" /> Secure Payout
                        </p>
                        <h2 className="text-xl font-bold text-white leading-tight">Refund from {brandName}</h2>
                        <p className="text-xs text-zinc-500 mt-1">Order #{refund?.orderId}</p>
                    </div>
                </div>

                {/* Amount Highlight */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex justify-between items-center">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Refund Amount</span>
                    <span className="text-2xl font-bold text-white font-mono">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(refund?.amount || 0)}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Enter UPI ID for Refund</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="mobile@oksbi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
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
