"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Papa from "papaparse";
import { FileDown, History, Calendar, Filter, Loader2 } from "lucide-react";

export default function ReportsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Filters
    const [scope, setScope] = useState("ALL"); // ALL, ACTIVE, BREACH, SETTLED, FAILED
    const [timeRange, setTimeRange] = useState("30"); // 7, 30, 365, CUSTOM
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    // History Data
    const [history, setHistory] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetchHistory();
            fetchMetrics();
            setLoading(false);
        }
    }, [user]);

    const fetchMetrics = async () => {
        if (!user) return;
        try {
            const mRef = doc(db, "merchants", user.uid, "metadata", "metrics");
            const mSnap = await getDoc(mRef);
            if (mSnap.exists()) setMetrics(mSnap.data());
        } catch (err) {
            console.error("Failed to fetch metrics", err);
        }
    };

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, "export_logs"),
                where("merchantId", "==", user.uid),
                orderBy("date", "desc"),
                limit(10)
            );
            const snapshot = await getDocs(q);
            setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleGenerate = async () => {
        if (!user) return;
        setGenerating(true);

        try {
            // 1. Calculate Date Range
            let startDate = new Date();
            let endDate = new Date(); // Now

            if (timeRange === "CUSTOM") {
                if (!customStart || !customEnd) {
                    alert("Please select start and end dates.");
                    setGenerating(false);
                    return;
                }
                startDate = new Date(customStart);
                endDate = new Date(customEnd);
                endDate.setHours(23, 59, 59, 999); // End of day
            } else {
                const days = parseInt(timeRange);
                startDate.setDate(endDate.getDate() - days);
            }

            // 2. Build Query
            // Note: Firestore requires composite index for 'merchantId + createdAt' mostly.
            // We fetch somewhat broadly and filter in memory if needed for complex status logic to avoid index hell.
            let q = query(
                collection(db, "refunds"),
                where("merchantId", "==", user.uid),
                where("createdAt", ">=", startDate),
                where("createdAt", "<=", endDate)
            );

            // 3. Execute Fetch
            const snapshot = await getDocs(q);
            let refunds = snapshot.docs.map(doc => doc.data());

            // 4. Apply Status/Scope Filters (Client Side for flexibility)
            if (scope !== "ALL") {
                refunds = refunds.filter(r => {
                    const status = r.status || "";
                    if (scope === "ACTIVE") return !status.includes("SETTLED") && !status.includes("FAILED");
                    if (scope === "SETTLED") return status.includes("SETTLED");
                    if (scope === "FAILED") return status.includes("FAILED") || status.includes("REJECTED");
                    if (scope === "BREACH") {
                        // Logic: Active AND Passed SLA
                        const isActive = !status.includes("SETTLED") && !status.includes("FAILED");
                        const isBreached = r.slaDueDate && new Date() > new Date(r.slaDueDate);
                        return isActive && isBreached;
                    }
                    return true;
                });
            }

            if (refunds.length === 0) {
                alert("No records found for the selected criteria.");
                setGenerating(false);
                return;
            }

            // 5. Generate CSV
            // 5. Generate CSV (Lifecycle Log Format)
            const csvData = refunds.map(r => {
                // Helper to find date for a specific status in the timeline
                const findDate = (statusKey: string) => {
                    const entry = r.timeline?.find((t: any) => t.status?.includes(statusKey));
                    return entry?.date ? new Date(entry.date).toLocaleDateString() : "";
                };

                return {
                    "Order ID": r.orderId,
                    "Amount": r.amount,
                    "Customer Name": r.customerName,
                    "Customer Email": r.customerEmail,
                    "Current Status": r.status,

                    // --- Lifecycle Dates ---
                    "Data Requested On": findDate('GATHERING_DATA'),
                    "Refund Initiated On": findDate('REFUND_INITIATED') || findDate('CREATED'), // Handle legacy CREATED
                    "Processing Started On": findDate('PROCESSING'),
                    "Settled On": findDate('SETTLED'),
                    "Failed On": findDate('FAILED'),

                    // --- Details ---
                    "Payment Method": r.paymentMethod || "UPI",
                    "UTR / Ref": r.proofs?.utr || r.proofs?.arn || "",
                    "Failure Reason": r.failureReason || ""
                };
            });

            const csvString = Papa.unparse(csvData);
            const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            // Trigger Download
            const link = document.createElement("a");
            link.href = url;
            link.download = `refunds_export_${scope}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 6. Log Action
            await addDoc(collection(db, "export_logs"), {
                merchantId: user.uid,
                date: new Date().toISOString(),
                type: scope,
                range: timeRange === "CUSTOM" ? "Custom" : `${timeRange} Days`,
                count: refunds.length,
                adminEmail: user.email
            });

            // Refresh History
            fetchHistory();

        } catch (error) {
            console.error("Export failed", error);
            alert("Export failed. Check console.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] p-8 text-white">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Data & Reports</h1>
                        <p className="text-gray-500 text-sm">Export your refund data for accounting and reconciliation.</p>
                    </div>

                    {/* Summary Metrics (Synced with Scoreboard) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-xl">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 font-mono">Total Settled</p>
                            <p className="text-2xl font-bold font-mono">₹{metrics?.totalSettledAmount?.toLocaleString('en-IN') || 0}</p>
                        </div>
                        <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-xl">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 font-mono">Active Liability</p>
                            <p className="text-2xl font-bold font-mono text-orange-400">₹{metrics?.activeLiability?.toLocaleString('en-IN') || 0}</p>
                        </div>
                        <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-xl">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 font-mono">Total Refunds</p>
                            <p className="text-2xl font-bold font-mono text-blue-400">{metrics?.totalRefunds || 0}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* LEFT: Export Controller */}
                        <div className="md:col-span-2">
                            <Card className="bg-[#0A0A0A] border-white/10 p-6 h-full">
                                <div className="flex items-center gap-2 mb-6 text-gray-200">
                                    <FileDown className="text-blue-500" />
                                    <h2 className="font-semibold">New Export</h2>
                                </div>

                                <div className="space-y-6">

                                    {/* Scope Selection */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Report Scope</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["ALL", "ACTIVE", "SETTLED", "FAILED", "BREACH"].map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setScope(opt)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${scope === opt
                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                        }`}
                                                >
                                                    {opt === "ALL" ? "All Refunds" :
                                                        opt === "ACTIVE" ? "Active / Pending" :
                                                            opt === "BREACH" ? "SLA Breaches" :
                                                                opt.charAt(0) + opt.slice(1).toLowerCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Date Range</label>
                                        <select
                                            value={timeRange}
                                            onChange={(e) => setTimeRange(e.target.value)}
                                            className="w-full md:w-1/2 p-3 bg-black border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 outline-none mb-3"
                                        >
                                            <option value="7">Last 7 Days</option>
                                            <option value="30">Last 30 Days</option>
                                            <option value="90">Last 3 Months</option>
                                            <option value="365">Last 1 Year</option>
                                            <option value="CUSTOM">Custom Range</option>
                                        </select>

                                        {timeRange === "CUSTOM" && (
                                            <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">From</label>
                                                    <input
                                                        type="date"
                                                        value={customStart}
                                                        onChange={(e) => setCustomStart(e.target.value)}
                                                        className="w-full p-2 bg-black border border-white/10 rounded-lg text-white text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">To</label>
                                                    <input
                                                        type="date"
                                                        value={customEnd}
                                                        onChange={(e) => setCustomEnd(e.target.value)}
                                                        className="w-full p-2 bg-black border border-white/10 rounded-lg text-white text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={generating}
                                            className="w-full flex items-center justify-center gap-2 py-3 text-base"
                                        >
                                            {generating ? (
                                                <>
                                                    <Loader2 className="animate-spin" /> Generating...
                                                </>
                                            ) : (
                                                <>Generate CSV Export</>
                                            )}
                                        </Button>
                                        <p className="text-xs text-center text-gray-600 mt-2">
                                            Includes all fields: Order ID, Amount, Customer, Status, UTR.
                                        </p>
                                    </div>

                                </div>
                            </Card>
                        </div>

                        {/* RIGHT: History */}
                        <div className="md:col-span-1">
                            <Card className="bg-[#0A0A0A] border-white/10 p-6 h-full flex flex-col">
                                <div className="flex items-center gap-2 mb-4 text-gray-200">
                                    <History className="text-gray-400" />
                                    <h2 className="font-semibold text-sm">Recent Exports</h2>
                                </div>

                                <div className="flex-1 overflow-y-auto min-h-[300px]">
                                    {history.length === 0 ? (
                                        <div className="text-center text-gray-600 py-10 text-sm">
                                            No export history found.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {history.map((log) => (
                                                <div key={log.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-white bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                                                            {log.type}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500">
                                                            {new Date(log.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Exported <span className="text-white font-mono">{log.count}</span> records
                                                    </p>
                                                    <p className="text-[10px] text-gray-600 mt-1">
                                                        Range: {log.range}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
