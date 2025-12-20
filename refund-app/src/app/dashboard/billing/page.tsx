"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, collection, query, orderBy, getDocs, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { PLANS, BillingPlan } from "@/config/plans";
import { CreditCard, Rocket, ShieldCheck, Zap, AlertCircle, History, Info, Receipt } from "lucide-react";

export default function BillingPage() {
    const { user } = useAuth();
    const [merchant, setMerchant] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [cycleUsage, setCycleUsage] = useState(0);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            try {
                // 1. Fetch Merchant Profile
                const mDoc = doc(db, "merchants", user.uid);
                const mSnap = await getDoc(mDoc);
                const mData = mSnap.data();
                if (mSnap.exists()) setMerchant(mData);

                // 2. Cycle Usage Count (Only refunds created since lastPaymentDate)
                const lastPay = mData?.lastPaymentDate?.seconds
                    ? new Date(mData.lastPaymentDate.seconds * 1000)
                    : new Date(new Date().setDate(new Date().getDate() - 30));

                const refundsRef = collection(db, "refunds");
                const cycleQuery = query(
                    refundsRef,
                    where("merchantId", "==", user.uid),
                    where("createdAt", ">=", lastPay)
                );
                const countSnap = await getCountFromServer(cycleQuery);
                setCycleUsage(countSnap.data().count);

                // 3. Fetch Metrics for Global Context
                const metricsSnap = await getDoc(doc(db, "merchants", user.uid, "metadata", "metrics"));
                if (metricsSnap.exists()) setMetrics(metricsSnap.data());

                // 4. Fetch Payment History
                const paymentsRef = collection(db, "merchants", user.uid, "payments");
                const pQuery = query(paymentsRef, orderBy("date", "desc"));
                const pSnap = await getDocs(pQuery);
                setPayments(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error("Failed to fetch billing data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;

    const planKey = merchant?.planType || "startup";
    const plan: BillingPlan = PLANS[planKey];
    const usage = cycleUsage;
    const limit = plan.includedRefunds;
    const usagePercent = Math.min((usage / limit) * 100, 100);

    // Date Logic
    const lastPayment = merchant?.lastPaymentDate?.seconds
        ? new Date(merchant.lastPaymentDate.seconds * 1000)
        : new Date();

    const nextRenewal = new Date(lastPayment);
    nextRenewal.setDate(nextRenewal.getDate() + 30);

    // Calculations
    const overageCount = Math.max(0, usage - limit);
    const overageFee = overageCount * plan.excessRate;
    const baseFee = plan.basePrice;
    const totalUpcoming = baseFee + overageFee;

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] p-8 bg-[#050505] text-white transition-all duration-300">
                <div className="max-w-4xl mx-auto space-y-8">

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
                                        {merchant?.subscriptionStatus?.toUpperCase() || "ACTIVE"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Monthly Base</p>
                                        <p className="text-xl font-bold text-white">₹{plan.basePrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Included Refunds</p>
                                        <p className="text-xl font-bold text-white">{plan.includedRefunds}</p>
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
                                            className={`h-full transition-all duration-500 ${usage > limit ? "bg-orange-500" : "bg-blue-600"}`}
                                            style={{ width: `${usagePercent}%` }}
                                        ></div>
                                    </div>
                                    {usage > limit && (
                                        <p className="text-[10px] text-orange-400 flex items-center gap-1 mt-2 font-mono">
                                            <AlertCircle size={10} /> {overageCount} EXCESS UNITS DETECTED (₹{plan.excessRate}/ea)
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
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Upcoming Bill</p>
                                            <p className="text-2xl font-bold text-blue-400">₹{totalUpcoming.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-500 font-bold">DUE ON RENEWAL</p>
                                            <p className="text-sm font-mono text-white">{nextRenewal.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                                    <p className="text-sm font-bold text-blue-400 mb-1 flex items-center gap-2">
                                        <Zap size={14} /> Invite-Only Mode Active
                                    </p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Ryyt is currently in Invite-Only mode. Please settle your overage and subscription via your assigned account manager's UPI/Bank details. Automatic card billing is disabled.
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
                                                            {p.date?.seconds ? new Date(p.date.seconds * 1000).toLocaleDateString() : 'Processing'}
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-white">
                                                            ₹{p.amount?.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                                                            {p.planName}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center">
                                                                <Link
                                                                    href={`/dashboard/reports?month=${p.date?.seconds ? new Date(p.date.seconds * 1000).getMonth() : ''}`}
                                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                                                >
                                                                    <Receipt size={12} /> View Report
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 bg-orange-500/5 border-t border-white/5">
                                    <p className="text-[10px] text-orange-400/80 text-center italic">
                                        Payment history is updated within 24 hours of your UPI transfer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Perks / Right Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6">
                                <Rocket size={32} className="text-blue-500 mb-4" />
                                <h4 className="font-bold text-white mb-2">Need a bigger plan?</h4>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    Upgrading to Growth or Scale reduces your excess rate and includes more monthly refunds.
                                </p>
                                <button
                                    onClick={() => alert("Redirecting to concierge upgrade... Contact support@ryyt.com")}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Upgrade Tier
                                </button>
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
            </main>
        </div>
    );
}
