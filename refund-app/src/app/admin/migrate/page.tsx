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
        <div className="max-w-4xl mx-auto p-8 bg-zinc-50 min-h-screen">
            <header className="mb-12">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                            Ryyt Command Center
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Administrative tools for data integrity and manual payment management.
                        </p>
                    </div>
                    {isAuthorized && (
                        <div className="text-right">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                SYSTEM AUTHORIZED
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {!isAuthorized ? (
                /* ... auth box ... */
                <div className="flex justify-center mt-12">
                    <Card className="w-full max-w-md p-8 border-2 border-gray-100 shadow-xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <KeyRound className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Admin Authorization</h2>
                            <p className="text-sm text-gray-500 text-center mt-1">
                                Enter the Master Admin Key to access migration tools.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                    Master Admin Key
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Enter your passkey"
                                    value={passkey}
                                    onChange={(e) => setPasskey(e.target.value)}
                                    className="border-2 focus:border-blue-500 transition-all font-mono"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center">
                                Logged in as: {user.email}
                            </p>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">

                    {/* SECTION 1: MERCHANT REGISTRY & SEARCH */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Search Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by Brand or Email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 py-6 bg-white border-2 border-zinc-200 rounded-2xl"
                                />
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-zinc-100 overflow-hidden">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest p-4 border-b border-zinc-50 bg-zinc-50/50">
                                    Registry ({filteredMerchants.length})
                                </p>
                                <div className="max-h-[500px] overflow-y-auto divide-y divide-zinc-50">
                                    {filteredMerchants.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleSelectMerchant(m)}
                                            className={`w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-center justify-between group ${selectedMerchantId === m.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                                        >
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{m.brandName || "No Brand"}</p>
                                                <p className="text-xs text-gray-500 truncate">{m.email}</p>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all ${selectedMerchantId === m.id ? 'text-blue-500 translate-x-1' : ''}`} />
                                        </button>
                                    ))}
                                    {filteredMerchants.length === 0 && (
                                        <div className="p-8 text-center">
                                            <p className="text-sm text-gray-400">No matches found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* COMMAND CENTER CARD */}
                        <div className="lg:col-span-2">
                            {selectedMerchantData ? (
                                <Card className="p-8 border-2 border-blue-600/20 bg-white shadow-2xl shadow-blue-600/5 h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                                                <Users className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">{selectedMerchantData.brandName}</h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-mono text-zinc-400">{selectedMerchantId}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedMerchantData.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {selectedMerchantData.subscriptionStatus?.toUpperCase() || 'UNKNOWN'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-widest">Billing Cycle</p>
                                            <p className="text-sm font-bold">
                                                {selectedMerchantData.lastPaymentDate?.seconds
                                                    ? new Date(selectedMerchantData.lastPaymentDate.seconds * 1000).toLocaleDateString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-8 mt-auto">
                                        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Zap size={10} /> Plan Insights</p>
                                            <p className="text-2xl font-black text-gray-900">{PLANS[selectedMerchantData.planType]?.name || "Startup"}</p>
                                            <p className="text-sm text-zinc-500">₹{PLANS[selectedMerchantData.planType]?.basePrice.toLocaleString()}/mo</p>
                                        </div>
                                        <div className={`p-6 bg-zinc-50 rounded-2xl border border-zinc-100 ${isUsageLoading ? 'animate-pulse' : ''}`}>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Activity size={10} /> Usage Logic</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-2xl font-black text-gray-900">{merchantUsage}</p>
                                                <p className="text-sm text-zinc-400">/ {PLANS[selectedMerchantData.planType]?.includedRefunds || 0}</p>
                                            </div>
                                            {merchantUsage > (PLANS[selectedMerchantData.planType]?.includedRefunds || 0) && (
                                                <p className="text-[10px] text-orange-600 font-bold mt-1">
                                                    + {merchantUsage - PLANS[selectedMerchantData.planType].includedRefunds} OVERAGE UNITS
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Button
                                            onClick={handleRecordPayment}
                                            disabled={isPaymentRunning}
                                            className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/20 text-lg font-bold flex items-center justify-center gap-3"
                                        >
                                            {isPaymentRunning ? <Loader2 className="animate-spin" /> : <><RefreshCw /> Record Payment & Renew Cycle</>}
                                        </Button>
                                        <p className="text-center text-[10px] text-gray-400">
                                            Action: Sets lastPaymentDate to NOW, pushes status to ACTIVE, and logs branded receipt.
                                        </p>
                                    </div>

                                    {paymentSuccess && (
                                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 text-sm animate-in zoom-in-95">
                                            <CheckCircle2 size={18} />
                                            <p><strong>Success!</strong> Merchant access renewed and payment recorded.</p>
                                        </div>
                                    )}
                                </Card>
                            ) : (
                                <div className="h-full border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-zinc-50/50">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-zinc-100">
                                        <Search className="w-8 h-8 text-zinc-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Discovery Portal</h3>
                                    <p className="max-w-xs text-sm">Select a merchant from the registry to access the Command Center and manage renewals.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 2: METRICS catch-up */}
                    <div className="bg-white p-8 rounded-3xl border-2 border-zinc-100 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Metrics catch-up (Phase 13)</h2>
                                <p className="text-sm text-gray-500">Recalculate O(1) Scoreboard for early adopters.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Card className={`p-6 border-2 ${step === 1 ? 'border-blue-500 bg-blue-50/30' : 'border-zinc-100'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>1</div>
                                    <h2 className="text-lg font-semibold">Dry Run</h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleMigration(true)}
                                    className="w-full"
                                >
                                    Run Aggregation Scan
                                </Button>
                            </Card>

                            <Card className={`p-6 border-2 ${step === 2 ? 'border-green-500 bg-green-50/30' : 'border-zinc-100'} ${step < 2 ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}>2</div>
                                    <h2 className="text-lg font-semibold">Commit</h2>
                                </div>
                                <Button
                                    onClick={() => handleMigration(false)}
                                    disabled={step !== 2}
                                    className="w-full bg-green-600"
                                >
                                    Commit to LIVE
                                </Button>
                            </Card>
                        </div>
                    </div>

                    {/* SECTION 3: MERCHANT DATA REPAIR */}
                    <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-3xl border-2 border-amber-200">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <AlertTriangle className="text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Merchant Data Repair (Phase 21)</h2>
                                <p className="text-sm text-amber-900/60">Non-destructive repair for legacy documents missing core fields.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => handleBackfill(true)}
                                disabled={isBackfillRunning}
                                className="flex-1 border-amber-600 text-amber-600 hover:bg-amber-100"
                            >
                                {isBackfillRunning ? "Scanning..." : "Dry Run Repair Scan"}
                            </Button>
                            <Button
                                onClick={() => handleBackfill(false)}
                                disabled={isBackfillRunning}
                                className="flex-1 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20"
                            >
                                {isBackfillRunning ? "Repairing..." : "Run Merchant Data Repair"}
                            </Button>
                        </div>

                        {backfillSummary && (
                            <div className="mt-6 p-4 bg-white/50 rounded-xl border border-amber-100">
                                <p className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">Repair Summary</p>
                                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                                    <div className="p-3 bg-white rounded-lg border border-amber-50">
                                        <p className="text-zinc-500">PROCESSED</p>
                                        <p className="text-xl font-bold">{backfillSummary.totalProcessed}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-amber-50">
                                        <p className="text-zinc-500">REPAIRED</p>
                                        <p className="text-xl font-bold text-amber-600">{backfillSummary.totalUpdated}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
