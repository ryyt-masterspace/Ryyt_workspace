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
import {
    AlertTriangle, CheckCircle2, ShieldCheck, Play, KeyRound,
    CreditCard, Users, RefreshCw, Loader2, Search, ChevronRight,
    Zap, Activity, MoreVertical, Calendar, Settings, Lock, Unlock, FileText
} from "lucide-react";
import { PLANS, PlanType } from "@/config/plans";
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
    const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

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
            setMerchantUsage(snap.size || 0);
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

    // --- LOGIC: PLAN CHANGE ---
    const handlePlanChange = async (newPlan: string) => {
        if (!selectedMerchantId) return;
        setIsUpdatingPlan(true);
        try {
            const ref = doc(db, "merchants", selectedMerchantId);
            await updateDoc(ref, { planType: newPlan });

            // Local Update
            setSelectedMerchantData((prev: any) => ({ ...prev, planType: newPlan }));
            setMerchants(prev => prev.map(m => m.id === selectedMerchantId ? { ...m, planType: newPlan } : m));
        } catch (error) {
            console.error(error);
            alert("Failed to update plan.");
        } finally {
            setIsUpdatingPlan(false);
        }
    };

    // --- LOGIC: STATUS TOGGLE ---
    const handleToggleStatus = async () => {
        if (!selectedMerchantId) return;
        setIsTogglingStatus(true);
        try {
            const currentStatus = selectedMerchantData?.subscriptionStatus || 'active';
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

            const ref = doc(db, "merchants", selectedMerchantId);
            await updateDoc(ref, { subscriptionStatus: newStatus });

            // Local Update
            setSelectedMerchantData((prev: any) => ({ ...prev, subscriptionStatus: newStatus }));
            setMerchants(prev => prev.map(m => m.id === selectedMerchantId ? { ...m, subscriptionStatus: newStatus } : m));
        } catch (error) {
            console.error(error);
            alert("Failed to toggle status.");
        } finally {
            setIsTogglingStatus(false);
        }
    };

    // --- LOGIC: RENEW & PAY ---
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
                address: "Madhyamgram, Kolkata 700129",
                type: "RENEWAL"
            });

            // 3. Update Merchant Doc (Renew)
            await updateDoc(merchantRef, {
                lastPaymentDate: serverTimestamp(),
                subscriptionStatus: "active"
            });

            // Local Update
            const updatedSnap = await getDoc(merchantRef);
            setSelectedMerchantData({ id: selectedMerchantId, ...updatedSnap.data() });
            fetchMerchantUsage(selectedMerchantId, updatedSnap.data()?.lastPaymentDate);

            setPaymentSuccess(true);
            setTimeout(() => setPaymentSuccess(false), 5000);
        } catch (error) {
            console.error("Payment Record Error:", error);
            alert("Failed to record payment.");
        } finally {
            setIsPaymentRunning(false);
        }
    };

    // Maintenance Handlers
    const handleMigration = async (isDryRun: boolean) => {
        setIsRunning(true);
        try {
            const result = await migrateMetrics(isDryRun);
            setSummary(result);
            if (!isDryRun && result.status === "COMMITTED") setStep(3);
            else if (isDryRun && result.status === "DRY_RUN") setStep(2);
        } catch (error) { console.error(error); } finally { setIsRunning(false); }
    };

    const handleBackfill = async (isDryRun: boolean) => {
        setIsBackfillRunning(true);
        try {
            const result = await backfillMerchants(isDryRun);
            setBackfillSummary(result);
        } catch (error) { console.error(error); } finally { setIsBackfillRunning(false); }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 border-t-4 border-indigo-600">
            <div className="max-w-[1600px] mx-auto px-6 py-8">

                {/* GLOBAL HEADER */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Ryyt Admin Console v3.0</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">System Command Center</h1>
                    </div>
                    {isAuthorized && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-medium text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Secure Session Active
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
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-8 min-h-[800px]">

                        {/* LEFT: MERCHANT REGISTRY (3 Cols) */}
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-[calc(100vh-200px)] sticky top-6">
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                                <div className="p-4 border-b border-slate-100 space-y-3">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <Users size={14} className="text-slate-400" />
                                        Registry
                                    </h3>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            placeholder="Search merchants..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                                    {filteredMerchants.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleSelectMerchant(m)}
                                            className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-all group relative flex items-center justify-between ${selectedMerchantId === m.id ? 'bg-indigo-50/50 hover:bg-indigo-50/50' : ''}`}
                                        >
                                            {selectedMerchantId === m.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
                                            <div className="min-w-0 pr-2">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <div className={`w-2 h-2 rounded-full ${m.subscriptionStatus === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500'}`} />
                                                    <span className={`font-medium truncate text-sm ${selectedMerchantId === m.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                        {m.brandName || "Untitled"}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-slate-400 font-mono pl-4 block truncate">
                                                    {m.email}
                                                </span>
                                            </div>
                                            {selectedMerchantId === m.id && <ChevronRight size={14} className="text-indigo-400" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {filteredMerchants.length} Records
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: COMMAND CONSOLE (9 Cols) */}
                        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">

                            {!selectedMerchantData ? (
                                <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-20 text-center bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                                        <Activity className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Select a Merchant</h3>
                                    <p className="text-slate-500 text-sm mt-2 max-w-sm">
                                        Access controls, billing, and subscription settings from the registry on the left.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* HEADER CARD */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-32 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg text-white text-2xl font-bold uppercase ${selectedMerchantData.subscriptionStatus === 'active' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' : 'bg-slate-800'}`}>
                                                    {selectedMerchantData.brandName?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h2 className="text-3xl font-bold text-slate-900">{selectedMerchantData.brandName}</h2>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedMerchantData.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                                            {selectedMerchantData.subscriptionStatus?.toUpperCase() || "UNKNOWN"}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 font-mono text-sm mb-4">{selectedMerchantData.email}</p>
                                                    <div className="flex gap-4 text-xs font-medium text-slate-600">
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                            <KeyRound size={12} className="text-slate-400" />
                                                            ID: <span className="font-mono text-slate-900">{selectedMerchantData.id}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* KPI Stats */}
                                            <div className="text-right space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Plan</p>
                                                <div className="text-2xl font-black text-slate-900">
                                                    {PLANS[selectedMerchantData.planType || 'startup']?.name || 'Startup'}
                                                </div>
                                                <p className="text-xs text-indigo-600 font-bold">
                                                    ₹{PLANS[selectedMerchantData.planType || 'startup']?.basePrice.toLocaleString()}/mo
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONTROL GRID */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                                        {/* 1. SUBSCRIPTION MANAGEMENT */}
                                        <Card className="p-8 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                    <Settings size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">Subscription Control</h3>
                                                    <p className="text-xs text-slate-500">Manage tier and account access.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Plan Selector */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Tier</label>
                                                    <div className="relative">
                                                        <select
                                                            value={selectedMerchantData.planType || 'startup'}
                                                            onChange={(e) => handlePlanChange(e.target.value)}
                                                            disabled={isUpdatingPlan}
                                                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl p-4 pr-10 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all disabled:opacity-50"
                                                        >
                                                            <option value="startup">Startup (₹999)</option>
                                                            <option value="growth">Growth (₹2,499)</option>
                                                            <option value="scale">Scale (₹4,999)</option>
                                                        </select>
                                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                                                    </div>
                                                </div>

                                                {/* Access Control */}
                                                <div className="pt-2">
                                                    <Button
                                                        onClick={handleToggleStatus}
                                                        disabled={isTogglingStatus}
                                                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${selectedMerchantData.subscriptionStatus === 'active'
                                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-100'
                                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-100'
                                                            }`}
                                                    >
                                                        {isTogglingStatus ? <Loader2 className="animate-spin" size={18} /> : (
                                                            selectedMerchantData.subscriptionStatus === 'active' ? (
                                                                <>
                                                                    <Lock size={18} /> Suspend Account Access
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Unlock size={18} /> Activate Account
                                                                </>
                                                            )
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* 2. BILLING & RENEWAL */}
                                        <Card className="p-8 border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                            {paymentSuccess && (
                                                <div className="absolute inset-0 bg-emerald-600 z-20 flex flex-col items-center justify-center text-white animate-in fade-in zoom-in-95">
                                                    <div className="p-4 bg-white/20 rounded-full mb-4 ring-4 ring-emerald-500">
                                                        <CheckCircle2 size={40} />
                                                    </div>
                                                    <h3 className="text-2xl font-black mb-1">Renewed!</h3>
                                                    <p className="text-emerald-100 font-medium">Invoice Generated & Cycle Reset</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">Billing & Renewal</h3>
                                                    <p className="text-xs text-slate-500">Process payments and reset cycles.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Cycle Start</p>
                                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                                        <Calendar size={14} className="text-indigo-500" />
                                                        {selectedMerchantData.lastPaymentDate?.seconds
                                                            ? new Date(selectedMerchantData.lastPaymentDate.seconds * 1000).toLocaleDateString()
                                                            : "N/A"
                                                        }
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Usage Overage</p>
                                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                                        <Activity size={14} className="text-orange-500" />
                                                        {isUsageLoading ? "..." : (
                                                            (merchantUsage || 0) > (PLANS[selectedMerchantData.planType || 'startup']?.includedRefunds || 0)
                                                                ? `+${(merchantUsage || 0) - (PLANS[selectedMerchantData.planType || 'startup']?.includedRefunds || 0)}`
                                                                : "None"
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleRecordPayment}
                                                disabled={isPaymentRunning}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl shadow-lg shadow-indigo-600/30 font-bold tracking-tight flex items-center justify-center gap-3 transition-all"
                                            >
                                                {isPaymentRunning ? <Loader2 className="animate-spin" /> : (
                                                    <>
                                                        <FileText size={18} /> Apply Payment & Renew Cycle
                                                    </>
                                                )}
                                            </Button>
                                        </Card>

                                    </div>
                                </>
                            )}

                            {/* BOTTOM TRAY: ADVANCED TOOLS */}
                            <div className="mt-auto pt-10 pb-20">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">Advanced Maintenance</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Aggregation Tool */}
                                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl group hover:border-indigo-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <Zap size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Metrics Sync</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Rebuild scoreboard caches</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" className="h-8 text-[10px]" onClick={() => handleMigration(true)}>Scan</Button>
                                            <Button className="h-8 text-[10px] bg-indigo-600 text-white" onClick={() => handleMigration(false)} disabled={step !== 2}>Run</Button>
                                        </div>
                                    </div>

                                    {/* Schema Tool */}
                                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl group hover:border-rose-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                                                <AlertTriangle size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Schema Repair</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Fix missing fields</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" className="h-8 text-[10px]" onClick={() => handleBackfill(true)} disabled={isBackfillRunning}>Audit</Button>
                                            <Button className="h-8 text-[10px] bg-rose-600 text-white" onClick={() => handleBackfill(false)} disabled={isBackfillRunning}>Fix</Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Logs Console */}
                                {(summary || backfillSummary) && (
                                    <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 max-h-40 overflow-y-auto">
                                        {summary && `[METRICS] ${summary.status}: ${summary.totalRefunds} processed.\n`}
                                        {backfillSummary && `[REPAIR] ${backfillSummary.status}: ${backfillSummary.totalUpdated} fixed.`}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
