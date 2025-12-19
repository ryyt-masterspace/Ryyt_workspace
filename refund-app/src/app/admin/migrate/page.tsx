"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { migrateMetrics } from "@/scripts/migrateMetrics";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { AlertTriangle, CheckCircle2, ShieldCheck, Play, Save, KeyRound } from "lucide-react";

// MASTER ADMIN KEY - In a real app, this should be an environment variable
const MASTER_KEY = "Ryyt-Admin-2025";

export default function AdminMigratePage() {
    const { user, loading: authLoading } = useAuth();
    const [summary, setSummary] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [step, setStep] = useState(1); // 1: Dry Run, 2: Commit
    const [passkey, setPasskey] = useState("");

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

    return (
        <div className="max-w-4xl mx-auto p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                    Ryyt Command Center
                </h1>
                <p className="text-gray-600 mt-2">
                    Initialize the O(1) Scoreboard by aggregating existing refund data.
                </p>
            </header>

            {/* PASSKEY AUTHENTICATION BOX */}
            {!isAuthorized ? (
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
                /* MIGRATION TOOLS (Only visible with correct passkey) */
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card className={`p-6 border-2 ${step === 1 ? 'border-blue-500 bg-blue-50/30' : 'border-transparent'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>1</div>
                                <h2 className="text-xl font-semibold">Dry Run (Safe)</h2>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Calculates all totals but does NOT touch the database. Highly recommended to verify numbers first.
                            </p>
                            <Button
                                onClick={() => handleMigration(true)}
                                disabled={isRunning || step > 2}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                {isRunning && step === 1 ? "Processing..." : <><Play className="w-4 h-4" /> Run Dry Run</>}
                            </Button>
                        </Card>

                        <Card className={`p-6 border-2 ${step === 2 ? 'border-green-500 bg-green-50/30' : 'border-transparent'} ${step < 2 ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}>2</div>
                                <h2 className="text-xl font-semibold">Commit to Live</h2>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Write the aggregated totals to the database. This will update the Dashboard Scoreboard permanently.
                            </p>
                            <Button
                                variant="ghost"
                                onClick={() => handleMigration(false)}
                                disabled={isRunning || step !== 2}
                                className={`w-full flex items-center justify-center gap-2 border-green-600 text-green-700 hover:bg-green-50 ${step === 2 ? 'bg-green-50' : ''}`}
                            >
                                {isRunning && step === 2 ? "Writing to DB..." : <><Save className="w-4 h-4" /> Commit to Live</>}
                            </Button>
                        </Card>
                    </div>

                    {summary && (
                        <Card className="p-8 border-t-4 border-t-blue-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                {summary.status === "DRY_RUN" ? <CheckCircle2 className="text-blue-500" /> : <CheckCircle2 className="text-green-500" />}
                                Migration Results ({summary.status})
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div>
                                    <p className="text-xs text-uppercase tracking-wider text-gray-500 mb-1 font-bold">MERCHANTS</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.merchantCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-uppercase tracking-wider text-gray-500 mb-1 font-bold">REFUNDS</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalRefunds}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-uppercase tracking-wider text-gray-500 mb-1 font-bold">TOTAL AMOUNT</p>
                                    <p className="text-2xl font-bold text-blue-600">₹{summary.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            {summary.status === "DRY_RUN" && (
                                <div className="mt-8 p-4 bg-amber-50 rounded-lg flex gap-3 border border-amber-200 text-amber-800 text-sm">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <p>
                                        <strong>Dry Run successful.</strong> No data was modified. If these numbers look correct, proceed to <strong>Step 2</strong> to commit these changes to the live database.
                                    </p>
                                </div>
                            )}

                            {summary.status === "COMMITTED" && (
                                <div className="mt-8 p-4 bg-green-50 rounded-lg flex gap-3 border border-green-200 text-green-800 text-sm">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <p>
                                        <strong>Success!</strong> All merchants have been initialized with aggregated metrics. You can now enable the "Scoreboard Aggregation" flag in features.ts.
                                    </p>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
