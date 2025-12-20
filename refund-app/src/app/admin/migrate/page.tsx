"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { migrateMetrics } from "@/scripts/migrateMetrics";
import { backfillMerchants } from "@/scripts/backfillMerchants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { collection, getDocs, doc, updateDoc, serverTimestamp, addDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertTriangle, CheckCircle2, ShieldCheck, Play, Save, KeyRound, CreditCard, Users, RefreshCw, Loader2, Search, ChevronRight, Zap, Activity } from "lucide-react";
import { PLANS } from "@/config/plans";
import { query, where } from "firebase/firestore";

// MASTER ADMIN KEY - In a real app, this should be an environment variable
const MASTER_KEY = "Ryyt-Admin-2025";

export default function AdminMigratePage() {
    const { user, loading: authLoading } = useAuth();
    const [summary, setSummary] = useState<any>(null);
    const [backfillSummary, setBackfillSummary] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isBackfillRunning, setIsBackfillRunning] = useState(false);
    const [isPaymentRunning, setIsPaymentRunning] = useState(false);
    const [step, setStep] = useState(1);
    const [passkey, setPasskey] = useState("");
    const [merchants, setMerchants] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMerchantId, setSelectedMerchantId] = useState("");
    const [selectedMerchantData, setSelectedMerchantData] = useState<any>(null);
    const [merchantUsage, setMerchantUsage] = useState<number>(0);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isUsageLoading, setIsUsageLoading] = useState(false);

    if (authLoading) return <div className="p-8 text-center text-gray-500">Loading Auth...</div>;

    // First barrier: Authentication
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
                <p className="text-gray-600">Please log in to the merchant dashboard first.</p>
            </div>
        );
    }

    const isAuthorized = passkey === MASTER_KEY;

    useEffect(() => {
        if (isAuthorized) {
            const fetchMerchants = async () => {
                const snap = await getDocs(collection(db, "merchants"));
                setMerchants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            };
            fetchMerchants();
        }
    }, [isAuthorized]);

    const filteredMerchants = merchants.filter(m =>
        (m.brandName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchMerchantUsage = async (mId: string, lastPay: any) => {
        setIsUsageLoading(true);
        try {
            const start = lastPay?.seconds ? new Date(lastPay.seconds * 1000) : new Date(0);
            const q = query(
                collection(db, "refunds"),
                where("merchantId", "==", mId),
                where("createdAt", ">=", start)
            );
            const snap = await getDocs(q);
            setMerchantUsage(snap.size);
        } catch (err) {
            console.error("Usage Fetch Error:", err);
        } finally {
            setIsUsageLoading(false);
        }
    };

    const handleSelectMerchant = (m: any) => {
        setSelectedMerchantId(m.id);
        setSelectedMerchantData(m);
        fetchMerchantUsage(m.id, m.lastPaymentDate);
    };

    const handleMigration = async (isDryRun: boolean) => {
        setIsRunning(true);
        try {
            const result = await migrateMetrics(isDryRun);
            setSummary(result);
            if (!isDryRun && result.status === "COMMITTED") {
                setStep(3); // Finished
            } else if (isDryRun && result.status === "DRY_RUN") {
                setStep(2); // Ready to commit
            }
        } catch (error) {
            console.error("Migration UI Error:", error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleBackfill = async (isDryRun: boolean) => {
        setIsBackfillRunning(true);
        try {
            const result = await backfillMerchants(isDryRun);
            setBackfillSummary(result);
        } catch (error) {
            console.error("Backfill UI Error:", error);
        } finally {
            setIsBackfillRunning(false);
        }
    };

    const handleRecordPayment = async () => {
        if (!selectedMerchantId) return;
        setIsPaymentRunning(true);
        setPaymentSuccess(false);

        try {
            // 1. Fetch Merchant for Plan Info
            const merchantRef = doc(db, "merchants", selectedMerchantId);
            const mSnap = await getDoc(merchantRef);
            const mData = mSnap.data();
            const planKey = mData?.planType || "startup";
            const plan = PLANS[planKey];

            // 2. Record Payment in sub-collection
            await addDoc(collection(db, "merchants", selectedMerchantId, "payments"), {
                amount: plan.basePrice,
                date: serverTimestamp(),
                planName: plan.name,
                status: "SUCCESS",
                issuer: "Calcure Technologies Private Limited", // Branded Identity
                address: "Madhyamgram, Kolkata 700129"
            });

            // 3. Update Merchant Doc (Renew)
            await updateDoc(merchantRef, {
                lastPaymentDate: serverTimestamp(),
                subscriptionStatus: "active"
            });

            setPaymentSuccess(true);
            setTimeout(() => setPaymentSuccess(false), 5000);
        } catch (error) {
            console.error("Payment Record Error:", error);
            alert("Failed to record payment.");
        } finally {
            setIsPaymentRunning(false);
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans text-slate-900 border-t-4 border-indigo-600">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/50">Admin Console v2.0</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">Ryyt Command Center</h1>
                        <p className="text-slate-500 mt-2 text-lg">Manage merchant access, billing cycles, and system integrity.</p>
                    </div>
                    {isAuthorized && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                            <ShieldCheck size={14} />
                            SYSTEM AUTHORIZED
                        </div>
                    )}
                </header>

                {!isAuthorized ? (
                    <div className="flex justify-center py-20">
                        <Card className="w-full max-w-md p-10 border border-slate-200 shadow-2xl rounded-2xl bg-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
                            <div className="flex flex-col items-center mb-10">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                                    <KeyRound className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Security Gate</h2>
                                <p className="text-sm text-slate-500 text-center mt-2 max-w-[240px]">
                                    Please enter your Master Admin Key to gain system-level access.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Master Admin Key
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="················"
                                        value={passkey}
                                        onChange={(e) => setPasskey(e.target.value)}
                                        className="h-14 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-mono text-center text-xl tracking-tighter rounded-xl"
                                    />
                                </div>
                                <div className="pt-4 border-t border-slate-50">
                                    <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider">
                                        Active Session: <span className="text-slate-600 font-bold">{user.email}</span>
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-16 animate-in fade-in duration-700">
                        {/* MAIN WORKSPACE: TWO COLUMN GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                            {/* LEFT COLUMN: MERCHANT REGISTRY (1/3) */}
                            <div className="lg:col-span-1 border border-slate-200 rounded-3xl bg-slate-50 overflow-hidden shadow-sm flex flex-col min-h-[700px]">
                                <div className="p-6 bg-white border-b border-slate-200 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Users size={16} className="text-indigo-600" />
                                        Merchant Registry
                                    </h3>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            placeholder="Find brand or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[600px] scrollbar-hide">
                                    {filteredMerchants.length > 0 ? (
                                        filteredMerchants.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => handleSelectMerchant(m)}
                                                className={`w-full text-left p-5 flex items-center justify-between transition-all group relative ${selectedMerchantId === m.id ? 'bg-white' : 'hover:bg-slate-100/50'}`}
                                            >
                                                {selectedMerchantId === m.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
                                                <div className="min-w-0 pr-4">
                                                    <p className={`font-bold truncate transition-colors ${selectedMerchantId === m.id ? 'text-indigo-600' : 'text-slate-900'}`}>
                                                        {m.brandName || "Untitled Merchant"}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{m.email}</p>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-all ${selectedMerchantId === m.id ? 'text-indigo-600 translate-x-1' : 'text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1'}`} />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">No results found</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-white border-t border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                        Total Items: {filteredMerchants.length}
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: MANAGEMENT CONSOLE (2/3) */}
                            <div className="lg:col-span-2">
                                {selectedMerchantData ? (
                                    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden min-h-[700px] flex flex-col relative group">
                                        {/* Header Area */}
                                        <div className="p-10 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/50">
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-600/20 text-white transform group-hover:rotate-3 transition-transform">
                                                        <Users size={32} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-3xl font-black text-slate-950 tracking-tight">{selectedMerchantData.brandName}</h2>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black font-mono tracking-tighter uppercase border border-slate-200/50">
                                                                ID: {selectedMerchantId}
                                                            </span>
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-current ${selectedMerchantData.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                                • {selectedMerchantData.subscriptionStatus || 'Unknown'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Last Billing Event</p>
                                                    <p className="text-base font-bold text-slate-900">
                                                        {selectedMerchantData.lastPaymentDate?.seconds
                                                            ? new Date(selectedMerchantData.lastPaymentDate.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                            : "Not Recorded"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Insights Row */}
                                            <div className="grid grid-cols-2 gap-8 mt-auto">
                                                <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-colors">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={14} className="text-indigo-400" /> Plan Profile</p>
                                                    <p className="text-3xl font-black text-slate-950">{PLANS[selectedMerchantData.planType]?.name || "Startup"}</p>
                                                    <div className="mt-2 text-indigo-600 flex items-baseline gap-1">
                                                        <span className="text-lg font-black uppercase">Total Due:</span>
                                                        <span className="text-4xl font-black tracking-tighter">₹{PLANS[selectedMerchantData.planType]?.basePrice.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className={`p-8 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all ${isUsageLoading ? 'animate-pulse' : 'hover:border-indigo-100'}`}>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} className="text-indigo-400" /> Processing Usage</p>
                                                    <div className="flex items-baseline gap-3">
                                                        <p className="text-5xl font-black text-slate-950 tracking-tighter">{merchantUsage}</p>
                                                        <p className="text-xl font-bold text-slate-300">/ {PLANS[selectedMerchantData.planType]?.includedRefunds || 0} base</p>
                                                    </div>
                                                    {merchantUsage > (PLANS[selectedMerchantData.planType]?.includedRefunds || 0) && (
                                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                                                            <AlertTriangle size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                                +{merchantUsage - PLANS[selectedMerchantData.planType].includedRefunds} Units Overage
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Section */}
                                        <div className="p-10 flex flex-col items-center justify-center flex-1 bg-slate-50/30">
                                            <div className="w-full max-w-sm space-y-6">
                                                <Button
                                                    onClick={handleRecordPayment}
                                                    disabled={isPaymentRunning}
                                                    className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-2xl shadow-2xl shadow-indigo-600/30 text-xl font-black tracking-tight flex items-center justify-center gap-4 transition-all"
                                                >
                                                    {isPaymentRunning ? (
                                                        <Loader2 className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <RefreshCw size={24} strokeWidth={3} />
                                                            Record & Renew Cycle
                                                        </>
                                                    )}
                                                </Button>
                                                <div className="flex bg-white/80 backdrop-blur p-4 rounded-xl border border-slate-100 shadow-sm items-start gap-4">
                                                    <ShieldCheck className="text-indigo-600 w-5 h-5 shrink-0 mt-0.5" />
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                        Executing this action will force a renewal event, reset the cycle start date to <span className="text-slate-900 font-bold underline">NOW</span>, and log a formalized, branded receipt for the founder's ledger.
                                                    </p>
                                                </div>
                                            </div>

                                            {paymentSuccess && (
                                                <div className="absolute inset-x-0 bottom-0 p-10 bg-emerald-600 text-white animate-in slide-in-from-bottom flex items-center justify-center gap-4 shadow-2xl">
                                                    <CheckCircle2 size={32} />
                                                    <div className="text-left">
                                                        <p className="text-lg font-black leading-none">Renewal Executed</p>
                                                        <p className="text-sm font-bold text-emerald-100 opacity-80 mt-1">Merchant access extended and transaction logged successfully.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[700px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center bg-slate-50/50">
                                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative">
                                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center animate-bounce shadow-lg">
                                                <Search size={14} className="text-white" />
                                            </div>
                                            <Users className="w-12 h-12 text-slate-200" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-950 tracking-tight mb-4">Discovery Mode</h3>
                                        <p className="max-w-md text-slate-500 text-lg leading-relaxed font-medium">
                                            Select a specific merchant from the <span className="text-slate-900 font-bold">Registry</span> on the left to activate the Management Console and handle billing operations.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION: SYSTEM MAINTENANCE */}
                        <div className="pt-16 border-t border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">System Maintenance & Infrastructure</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Metrics Tool */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Scoreboard Sync (Phase 13)</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">O(1) Metrics Recalculation</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleMigration(true)}
                                            className="px-4 py-2 bg-white text-slate-600 border-slate-200 text-xs font-black shadow-sm"
                                        >
                                            Scan
                                        </Button>
                                        <Button
                                            onClick={() => handleMigration(false)}
                                            disabled={step !== 2}
                                            className={`px-4 py-2 border-none text-xs font-black shadow-lg ${step === 2 ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                        >
                                            Commit
                                        </Button>
                                    </div>
                                </div>

                                {/* Repair Tool */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-rose-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Document Repair (Phase 21)</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Non-Destructive Backfill</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleBackfill(true)}
                                            disabled={isBackfillRunning}
                                            className="px-4 py-2 bg-white text-slate-600 border-slate-200 text-xs font-black shadow-sm"
                                        >
                                            Check
                                        </Button>
                                        <Button
                                            onClick={() => handleBackfill(false)}
                                            disabled={isBackfillRunning}
                                            className="px-4 py-2 bg-indigo-600 text-white border-none text-xs font-black shadow-lg shadow-indigo-600/20"
                                        >
                                            Repair
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Reports (Compact) */}
                            {(summary || backfillSummary) && (
                                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl animate-in zoom-in-95">
                                    <div className="flex items-center gap-3 p-4 bg-slate-800 border-b border-slate-700">
                                        <Play size={14} className="text-emerald-400" />
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Execution Logs</span>
                                    </div>
                                    <div className="p-6 font-mono text-[11px] leading-relaxed text-emerald-400/80 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                                        {summary && `[METRICS] Result: ${summary.status}\nRefunds Scanned: ${summary.totalRefunds}\nMerchants Affected: ${summary.merchantCount}\n------------------\n`}
                                        {backfillSummary && `[REPAIR] Result: ${backfillSummary.status}\nProcessed: ${backfillSummary.totalProcessed}\nUpdated: ${backfillSummary.totalUpdated}`}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
