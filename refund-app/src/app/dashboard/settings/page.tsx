"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import Sidebar from "@/components/dashboard/Sidebar";
import Button from "@/components/ui/Button";
import { Save, Store, Mail, Clock, CheckCircle2, RotateCcw, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Form State
    const [brandName, setBrandName] = useState("");
    const [supportEmail, setSupportEmail] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [defaultSla, setDefaultSla] = useState(2);

    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Default email fallback
                setSupportEmail(currentUser.email || "");

                // Fetch existing settings
                try {
                    const docRef = doc(db, "merchants", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.brandName) setBrandName(data.brandName);
                        if (data.supportEmail) setSupportEmail(data.supportEmail);
                        if (data.logo) setLogoUrl(data.logo);
                        if (data.defaultSla) setDefaultSla(data.defaultSla);
                    }
                } catch (err) {
                    console.error("Error fetching settings:", err);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setSuccessMessage("");

        try {
            await setDoc(doc(db, "merchants", user.uid), {
                brandName,
                supportEmail,
                logo: logoUrl,
                defaultSla: Number(defaultSla)
            }, { merge: true });

            setSuccessMessage("Settings saved successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleFixDuplicates = async () => {
        if (!user || !confirm("This will scan ALL refunds and rename duplicate Order IDs (e.g., adding _COPY_1). This action cannot be undone. Proceed?")) return;

        setIsFixing(true);
        try {
            // 1. Fetch ALL refunds
            const q = query(
                collection(db, "refunds"),
                where("merchantId", "==", user.uid)
            );
            const snapshot = await getDocs(q);

            // 2. Group by Order ID
            const groups: { [key: string]: any[] } = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const oid = (data.orderId || "").toString().trim();
                if (!oid) return;
                if (!groups[oid]) groups[oid] = [];
                groups[oid].push({ id: doc.id, ...data });
            });

            // 3. Find Duplicates
            let fixedCount = 0;
            const batch = writeBatch(db);
            let operationCount = 0;

            Object.entries(groups).forEach(([orderId, docs]) => {
                if (docs.length > 1) {
                    // Sort by creation time (keep oldest) - fallback to existing logic if no createdAt
                    docs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

                    // Skip the first (original), rename the rest
                    for (let i = 1; i < docs.length; i++) {
                        const duplicate = docs[i];
                        const newOrderId = `${orderId}_COPY_${i}`;
                        const ref = doc(db, "refunds", duplicate.id);
                        batch.update(ref, {
                            orderId: newOrderId,
                            note: (duplicate.note || "") + " [System: Renamed from duplicate]"
                        });
                        operationCount++;
                        fixedCount++;
                    }
                }
            });

            if (operationCount > 0) {
                await batch.commit();
                alert(`Success! Renamed ${fixedCount} duplicate entries.`);
            } else {
                alert("Scan Complete. No duplicates found.");
            }

        } catch (error) {
            console.error("Error fixing duplicates:", error);
            alert("Failed to fix duplicates. Check console.");
        } finally {
            setIsFixing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar />

            <main className="flex-1 ml-[64px] md:ml-[240px] p-8 bg-[#050505] text-white transition-all duration-300">
                <div className="max-w-2xl mx-auto space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Merchant Settings</h1>
                        <p className="text-gray-400">Manage your brand identity and refund defaults.</p>
                    </div>

                    {/* Settings Form */}
                    <form onSubmit={handleSave} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-6 space-y-6 relative overflow-hidden">

                        {/* Brand Identity Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-white border-b border-white/5 pb-2">
                                <Store size={18} className="text-blue-500" />
                                Brand Identity
                            </h2>

                            {/* Brand Name */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">Brand Name</label>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                />
                                <p className="text-xs text-gray-500">Displayed on customer tracking pages.</p>
                            </div>

                            {/* Support Email */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">Support Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                    <input
                                        type="email"
                                        value={supportEmail}
                                        onChange={(e) => setSupportEmail(e.target.value)}
                                        placeholder="support@example.com"
                                        className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Where customers can reply to refund emails.</p>
                            </div>

                            {/* Brand Logo URL */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">Brand Logo URL</label>
                                <input
                                    type="text"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                />
                                <p className="text-xs text-gray-500">Public URL of your logo (renders in tracking pages and emails).</p>
                            </div>
                        </div>

                        {/* Operational Defaults Section */}
                        <div className="space-y-4 pt-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-white border-b border-white/5 pb-2">
                                <Clock size={18} className="text-orange-500" />
                                Operations
                            </h2>

                            {/* Default SLA */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">Default SLA (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={defaultSla}
                                    onChange={(e) => setDefaultSla(Number(e.target.value))}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                                />
                                <p className="text-xs text-gray-500">Standard turnaround time for new refunds.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            {successMessage ? (
                                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg text-sm animate-in fade-in slide-in-from-left-2">
                                    <CheckCircle2 size={16} />
                                    {successMessage}
                                </div>
                            ) : (
                                <span>{/* Spacer */}</span>
                            )}

                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 min-w-[120px] justify-center"
                            >
                                {saving ? "Saving..." : (
                                    <>
                                        <Save size={16} /> Save Changes
                                    </>
                                )}
                            </Button>
                        </div>

                    </form>

                    {/* Developer & API Section */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-6 space-y-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-white border-b border-white/5 pb-2">
                            <ShieldAlert size={18} className="text-blue-500" />
                            API & Integrations
                        </h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                                <h3 className="text-sm font-bold text-blue-400 mb-1">Scale your operations</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Integration with your existing ERP or custom storefront is available via our REST API.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Live API Key</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value="sk_live_••••••••••••••••"
                                            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-zinc-600 text-sm font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => alert("API access is currently in invitation-only mode. Contact support to request access.")}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                                        >
                                            Generate API Key
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 italic mt-2">
                                        * API access is currently in invitation-only mode. Contact support to request access.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Management Section */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <ShieldAlert size={18} className="text-amber-500" />
                            Data Management
                        </h2>

                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-medium text-amber-200">Fix Duplicate Order IDs</h3>
                                <p className="text-sm text-zinc-400">
                                    Scans for duplicate 'orderId' fields and renames them to ensure uniqueness.
                                </p>
                            </div>
                            <Button
                                onClick={handleFixDuplicates}
                                disabled={isFixing}
                                className="h-9 border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 shrink-0 ml-4 bg-transparent px-4"
                            >
                                {isFixing ? (
                                    <>
                                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Scanning...
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert className="w-4 h-4 mr-2" /> Scan & Fix
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
