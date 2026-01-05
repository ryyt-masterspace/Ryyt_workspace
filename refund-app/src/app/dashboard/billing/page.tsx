"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, orderBy, where, getCountFromServer, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { PLANS, BillingPlan } from "@/config/plans";
import { CreditCard, Rocket, ShieldCheck, Zap, AlertCircle, History, Info, Receipt, Loader2 } from "lucide-react";
import { generateInvoice, InvoiceMerchantData, InvoicePaymentData } from "@/lib/invoiceGenerator";
import { calculateFinalBill } from "@/lib/taxCalculator";
import Script from "next/script";


// Local extension for this page
interface BillingMerchantData extends InvoiceMerchantData {
    lastPaymentDate?: { seconds: number };
    subscriptionStatus?: string;
    planType?: string;
    upcomingPlan?: string;
    upcomingPlanDate?: { seconds: number; nanoseconds: number } | Date | string | number | null;
    razorpaySubscriptionId?: string;
}

export default function BillingPage() {
    const { user } = useAuth();
    const [merchant, setMerchant] = useState<BillingMerchantData | null>(null);
    const [cycleUsage, setCycleUsage] = useState(0);
    const [payments, setPayments] = useState<InvoicePaymentData[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDownloadInvoice = async (payment: InvoicePaymentData) => {
        if (!merchant) return;
        try {
            await generateInvoice(merchant, payment);
        } catch (e) {
            console.error(e);
            alert("Could not generate invoice.");
        }
    };

    useEffect(() => {
        if (!user) return;

        // 1. Real-time Merchant Listener
        const mRef = doc(db, "merchants", user.uid);
        const unsubscribeMerchant = onSnapshot(mRef, async (docSnap) => {
            if (docSnap.exists()) {
                const mData = docSnap.data() as BillingMerchantData;
                setMerchant(mData);

                // 2. Fetch Cycle Usage whenever Merchant (lastPaymentDate) changes
                const lastPayDate = (mData && mData.lastPaymentDate && mData.lastPaymentDate.seconds)
                    ? new Date(mData.lastPaymentDate.seconds * 1000)
                    : new Date(new Date().setDate(new Date().getDate() - 30));

                const refundsRef = collection(db, "refunds");
                const cycleQuery = query(
                    refundsRef,
                    where("merchantId", "==", user.uid),
                    where("createdAt", ">=", lastPayDate)
                );
                const countSnap = await getCountFromServer(cycleQuery);
                setCycleUsage(countSnap.data().count);
            }
            setLoading(false);
        });

        // 3. Real-time Payments Listener
        const pRef = collection(db, "merchants", user.uid, "payments");
        const pQuery = query(pRef, orderBy("date", "desc"));
        const unsubscribePayments = onSnapshot(pQuery, (snap) => {
            setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as InvoicePaymentData)));
        });

        return () => {
            unsubscribeMerchant();
            unsubscribePayments();
        };
    }, [user]);

    const [showPlanModal, setShowPlanModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Determines if we should Create New or Update Existing
    const isResubscribing = merchant?.subscriptionStatus === 'cancelled' || merchant?.subscriptionStatus === 'expired' || merchant?.subscriptionStatus === 'halted';

    const handleUpdatePlan = async (newPlanType: string) => {
        if (!user || !merchant) return;
        setIsUpdating(true);

        try {
            if (isResubscribing) {
                // Scenario: Re-subscribing (Create New)
                // We need to trigger the Razorpay Payment Modal on the frontend, usually.
                // But wait, 'create-subscription' API returns a subscriptionId.
                // The actual generic "Buy" flow usually handles the Razorpay.open() calls.
                // IF this dashboard is just for "Switching", we might not have the full Razorpay.open() logic here?
                // Let's check if we can reuse the standard checkout flow or direct to it.
                // For now, let's assume we call 'create-subscription' and then we need to hand off to a payment handler.
                // However, "BillingPage" is usually post-onboarding.
                // If we create a sub here, we need to open the checkout.
                // Since strict "Re-subscription" isn't fully scaffolded with Razorpay.js script loading here,
                // ALERNATIVE: Redirect to the Onboarding/Pricing page? Or implement simple checkout here.
                // Let's implement simple checkout here because redirecting is jarring.

                // 1. Create Subscription
                const res = await fetch('/api/razorpay/create-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.uid, planType: newPlanType })
                });
                const data = await res.json();

                if (data.error) {
                    alert(data.error);
                    return;
                }

                if (!(window as unknown as { Razorpay: unknown }).Razorpay) {
                    alert("Payment SDK not loaded. Please refresh.");
                    return;
                }

                // ---------------------------------------------------------
                // LEAD SECURITY ARCHITECT: REWRITTEN PAYMENT FLOW
                // 1. STRICT OPTIONS: No amount/currency with Subscription ID.
                // 2. SILENT HANDLER: No client-side DB writes. Polling Only.
                // ---------------------------------------------------------

                if (data.subscriptionId) {
                    // Define options strictly for Subscription
                    const options: any = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                        subscription_id: data.subscriptionId, // ONLY Subscription ID
                        name: "Ryyt",
                        description: `${PLANS[newPlanType].name} Plan`,
                        image: "/logo-white.png",
                        handler: function (response: any) {
                            // --- SILENT HANDLER ---
                            // 1. Set Loading / Verifying State
                            setIsVerifying(true);
                            setIsUpdating(true);

                            // 2. Start Polling Loop (Server-Side Check)
                            let attempts = 0;
                            const maxAttempts = 15; // 30 seconds (2s interval)

                            const pollInterval = setInterval(async () => {
                                attempts++;
                                try {
                                    // Fetch FRESH document from server
                                    const freshDoc = await getDoc(doc(db, "merchants", user.uid));

                                    if (freshDoc.exists()) {
                                        const serverStatus = freshDoc.data().subscriptionStatus;

                                        // CHECK: Only redirect if Server says ACTIVE
                                        if (serverStatus === 'active') {
                                            clearInterval(pollInterval);
                                            alert("Subscription Verified & Active!");
                                            window.location.reload();
                                        }
                                        // TIMEOUT
                                        else if (attempts >= maxAttempts) {
                                            clearInterval(pollInterval);
                                            alert("Payment verification timed out. If money was deducted, it will be refunded automatically. Please try again.");
                                            setIsVerifying(false); // Reset UI
                                            setIsUpdating(false);
                                        }
                                    }
                                } catch (err) {
                                    console.error("Polling Error:", err);
                                }
                            }, 2000); // Check every 2 seconds
                        },
                        modal: {
                            ondismiss: function () {
                                console.log("Payment Modal Closed by User");
                                if (!isVerifying) setIsUpdating(false);
                            }
                        },
                        theme: {
                            color: "#4F46E5"
                        }
                    };

                    // EXPLICIT SECURITY DELETE
                    // Just in case any object merging happened above (though we defined new)
                    delete options.amount;
                    delete options.currency;
                    delete options.order_id;
                    if (options.prefill) delete options.prefill.amount;

                    const rzp1 = new (window as unknown as { Razorpay: new (o: any) => { open: () => void } }).Razorpay(options);
                    rzp1.open();

                } else {
                    throw new Error("Invalid Payment Mode: Missing Subscription ID");
                }

            } else {
                // Scenario: Updating Active Subscription
                const res = await fetch('/api/razorpay/update-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.uid, newPlanType })
                });

                const data = await res.json();
                if (data.success) {
                    alert(data.mode === 'upgrade'
                        ? "Upgrade successful! Your new limits are active."
                        : `Downgrade scheduled for ${new Date(data.effectiveDate).toLocaleDateString()}.`);
                    window.location.reload();
                } else {
                    if (data.error === 'UPI_RESTRICTION') {
                        alert("UPI Limitation: Automatic switching is not supported on UPI. Please Cancel your current plan and subscribe to the new one.");
                    } else {
                        alert(data.error || "Failed to change plan.");
                    }
                }
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred.");
        } finally {
            if (!isResubscribing) { // If resubscribing, 'finally' happens after modal dismiss usually, but here we clear loader
                setIsUpdating(false);
                setShowPlanModal(false);
            }
        }
    };

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;

    const currentPlanKey = merchant?.planType || "startup";
    const plan: BillingPlan = PLANS[currentPlanKey];
    const usage = cycleUsage;
    const limit = plan.limit;
    const usagePercent = Math.min((usage / limit) * 100, 100);

    // Date Logic
    const lastPayment = merchant?.lastPaymentDate?.seconds
        ? new Date(merchant.lastPaymentDate.seconds * 1000)
        : new Date();

    const nextRenewal = new Date(lastPayment);
    nextRenewal.setDate(nextRenewal.getDate() + 30);

    // Task 5: Upgrade Cost Preview
    const getUpgradePratatedCost = (targetPlan: BillingPlan) => {
        const remainingDays = Math.max(1, Math.ceil((nextRenewal.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
        const diff = targetPlan.price - plan.price;
        if (diff <= 0) return 0;
        const prorated = (diff / 30) * remainingDays;
        return calculateFinalBill(prorated).total;
    };

    // Calculations
    const overageCount = 0;
    const overageFee = 0;
    const baseFee = plan.price;

    // Centralized GST Math
    const { subtotal, gstAmount, total: totalUpcoming } = calculateFinalBill(baseFee);

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] p-8 bg-[#050505] text-white transition-all duration-300">
                <Script src="https://checkout.razorpay.com/v1/checkout.js" />
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Pending Change Alert */}
                    {/* Upcoming Plan Change Banner */}
                    {merchant?.upcomingPlan && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="text-amber-500" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-amber-500">Scheduled Plan Change</p>
                                    <p className="text-xs text-amber-500/80">
                                        Your subscription will switch to <strong>{PLANS[merchant.upcomingPlan].name}</strong> on {(() => {
                                            const effectiveDate = merchant.upcomingPlanDate;
                                            try {
                                                const dateObj = (effectiveDate as unknown as { toDate?: () => Date })?.toDate
                                                    ? (effectiveDate as unknown as { toDate: () => Date }).toDate()
                                                    : (effectiveDate ? new Date(effectiveDate as string | number | Date) : null);
                                                if (!dateObj || isNaN(dateObj.getTime())) return nextRenewal.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                                                return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                                            } catch {
                                                return nextRenewal.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                                            }
                                        })()}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Subscription</h1>
                        <p className="text-gray-400">Manage your plan and monitor monthly volume usage.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Current Plan Card */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap size={120} />
                                </div>

                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-1">Current Plan</p>
                                        <h2 className="text-3xl font-bold text-white">{plan.name}</h2>
                                    </div>
                                    <div className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                                        {(merchant?.subscriptionStatus || "ACTIVE").toUpperCase()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Monthly Recurring</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm text-gray-500 line-through">₹{plan.originalPrice.toLocaleString()}</span>
                                            <p className="text-xl font-bold text-white">₹{plan.price.toLocaleString()}</p>
                                        </div>
                                        <p className="text-[10px] text-blue-400 mt-1">+ ₹{plan.setupFee.toLocaleString()} One-time Setup Fee</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Monthly Refunds</p>
                                        <p className="text-xl font-bold text-white">{plan.limit}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-zinc-500">
                                            Cycle: {lastPayment.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {nextRenewal.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className={usage > limit ? "text-orange-400" : "text-blue-400"}>
                                            {usage} / {limit} Refunds
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full transition-all duration-500 ${usage >= limit ? "bg-red-500" : "bg-blue-600"}`}
                                            style={{ width: `${usagePercent}%` }}
                                        ></div>
                                    </div>
                                    {usage >= limit && (
                                        <p className="text-[10px] text-red-500 flex items-center gap-1 mt-2 font-mono">
                                            <AlertCircle size={10} /> PLAN LIMIT REACHED. PLEASE UPGRADED TO PROCESS MORE REFUNDS.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Transparent Upcoming Bill Breakdown */}
                            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <CreditCard size={18} className="text-gray-400" />
                                        Calculated Upcoming Bill
                                    </h3>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Renewal Date</p>
                                        <p className="text-sm font-mono text-white">{nextRenewal.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                    <div className="flex justify-between text-sm">
                                        <div className="space-y-0.5">
                                            <p className="text-gray-300 font-medium">{plan.name} Subscription</p>
                                            <p className="text-[10px] text-gray-500">Prepaid for next 30 days</p>
                                        </div>
                                        <span className="font-mono text-white">₹{baseFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div className="space-y-0.5">
                                            <p className="text-gray-300 font-medium">Usage Overages</p>
                                            <p className="text-[10px] text-gray-500">{overageCount} refunds above {limit} limit</p>
                                        </div>
                                        <span className="font-mono text-orange-400">+ ₹{overageFee.toLocaleString()}</span>
                                    </div>

                                    <div className="h-px bg-white/5 my-2"></div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Subtotal (Net)</p>
                                            <p className="text-sm font-bold text-white mb-2">₹{subtotal.toLocaleString()}</p>

                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">GST (18%)</p>
                                            <p className="text-sm font-bold text-white mb-3">₹{gstAmount.toLocaleString()}</p>

                                            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Total Upcoming Bill</p>
                                            <p className="text-3xl font-bold text-blue-400">₹{totalUpcoming.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-500 font-bold">DUE ON RENEWAL</p>
                                            <p className="text-sm font-mono text-white">{nextRenewal.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                                    <p className="text-sm font-bold text-blue-400 mb-1 flex items-center gap-2">
                                        <Zap size={14} /> Automated Billing Active
                                    </p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Your subscription is managed via Razorpay. Your monthly limit is refreshed automatically at the start of each billing cycle.
                                    </p>
                                </div>
                                <p className="text-[10px] text-gray-600 mt-4 flex items-center gap-1.5 italic">
                                    <Info size={12} /> This is a live estimation based on current cycle activity.
                                </p>
                            </div>

                            {/* Transaction History Section */}
                            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <History size={18} className="text-gray-400" />
                                        Past Payments
                                    </h3>
                                    <span className="text-[10px] text-zinc-500 font-mono">Official Ledger</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-black/20 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                                                <th className="px-6 py-4 font-bold">Date</th>
                                                <th className="px-6 py-4 font-bold">Amount</th>
                                                <th className="px-6 py-4 font-bold">Plan</th>
                                                <th className="px-6 py-4 font-bold text-center">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-600 text-sm">
                                                        No payment records found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                payments.map((p) => (
                                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4 text-sm font-mono text-gray-400">
                                                            {(p.date as { seconds: number })?.seconds ? new Date((p.date as { seconds: number }).seconds * 1000).toLocaleDateString() : 'Processing'}
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-white">
                                                            ₹{p.amount?.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                                                            {p.planName}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center">
                                                                <button
                                                                    onClick={() => handleDownloadInvoice(p)}
                                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                                                >
                                                                    <div className="p-1 bg-blue-500/10 rounded-md">
                                                                        <Receipt size={12} />
                                                                    </div>
                                                                    Download XML/PDF
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Perks / Right Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6">
                                <Rocket size={32} className="text-blue-500 mb-4" />
                                <h4 className="font-bold text-white mb-2">{isResubscribing ? 'Reactivate Subscription' : 'Modify Subscription'}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    {isResubscribing
                                        ? "Your plan is currently inactive. Select a plan to restore access immediately."
                                        : "Switch your plan to better align with your monthly refund volume."}
                                </p>
                                <button
                                    onClick={() => setShowPlanModal(true)}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Change Plan
                                </button>
                                {!isResubscribing && (
                                    <CancelButton subscriptionId={merchant?.razorpaySubscriptionId} userId={user?.uid || ''} />
                                )}
                            </div>

                            <div className="p-6 border border-white/5 rounded-2xl bg-white/2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Enterprise Security</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-xs text-gray-400">
                                        <ShieldCheck size={14} className="text-emerald-500" /> PCI-DSS Compliant Infrastructure
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-400">
                                        <ShieldCheck size={14} className="text-emerald-500" /> Automated Reconciliation
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-400">
                                        <ShieldCheck size={14} className="text-emerald-500" /> Multi-Tenant Data Isolation
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>


                {/* Task 1: Change Plan Modal */}
                {
                    showPlanModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                                {isVerifying ? (
                                    <div className="p-12 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                                        <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
                                        <p className="text-gray-400">Please wait while we sync your subscription...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                            <div>
                                                <h2 className="text-2xl font-bold">Select New Plan</h2>
                                                <p className="text-sm text-gray-500">Choose the best fit for your growth.</p>
                                            </div>
                                            <button onClick={() => setShowPlanModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                                <Zap className="rotate-45" size={24} />
                                            </button>
                                        </div>

                                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {Object.entries(PLANS).map(([key, p]) => {
                                                const isCurrent = key === currentPlanKey;
                                                const isUpgrade = p.price > plan.price;
                                                const upgradeCost = getUpgradePratatedCost(p);

                                                return (
                                                    <div
                                                        key={key}
                                                        className={`p-6 rounded-2xl border transition-all ${isCurrent ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}
                                                    >
                                                        <div className="mb-4">
                                                            <h3 className="font-bold text-lg">{p.name}</h3>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-xs text-gray-500 line-through">₹{p.originalPrice}</span>
                                                                <p className="text-xl font-mono">₹{p.price}</p>
                                                            </div>
                                                            <p className="text-[10px] text-blue-400 mt-1">+ ₹{p.setupFee} Setup Fee</p>
                                                        </div>

                                                        <ul className="text-[10px] space-y-2 text-gray-400 mb-6">
                                                            <li>• {p.limit} Refunds/mo</li>
                                                            <li>• No Overage Charges</li>
                                                            <li>• Hard Usage Limit</li>
                                                        </ul>

                                                        {isCurrent ? (
                                                            <div className="w-full py-2 text-center text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 rounded-lg">
                                                                Current Plan
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleUpdatePlan(key)}
                                                                disabled={isUpdating}
                                                                className="w-full py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                            >
                                                                {isUpdating ? 'Wait...' : 'Switch'}
                                                            </button>
                                                        )}

                                                        {!isCurrent && isUpgrade && upgradeCost > 0 && (
                                                            <p className="mt-3 text-[9px] text-emerald-400 leading-tight">
                                                                Upgrade now for ₹{upgradeCost.toFixed(0)}* proration
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-4">
                                            <div className="flex gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                                                    <Info size={16} className="text-blue-400" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-white">How charges work:</p>
                                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                                        <strong>Upgrades:</strong> You will be charged the prorated difference for the remainder of this month immediately to activate your new limits.
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                                        <strong>Downgrades:</strong> Your plan change will take effect on your next billing date ({nextRenewal.toLocaleDateString()}).
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-600 italic">* Estimated cost includes 18% GST. Actual charge may vary by a few rupees based on exact timing.</p>
                                        </div>
                                    </>)}
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
}

// Button Component in Main Render
function CancelButton({ subscriptionId, userId }: { subscriptionId?: string, userId: string }) {
    const [isCancelling, setIsCancelling] = useState(false);

    if (!subscriptionId) return null;

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features immediately.")) return;

        setIsCancelling(true);
        try {
            const res = await fetch('/api/razorpay/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId, userId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Subscription cancelled successfully.");
                window.location.reload();
            } else {
                alert(data.error || "Failed to cancel.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred.");
        } finally {
            setIsCancelling(false);
        }
    }

    return (
        <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="w-full mt-3 py-3 bg-red-900/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-900/30 transition-all font-mono uppercase tracking-widest text-[10px]"
        >
            {isCancelling ? 'Processing...' : 'Cancel Subscription'}
        </button>
    );
}
