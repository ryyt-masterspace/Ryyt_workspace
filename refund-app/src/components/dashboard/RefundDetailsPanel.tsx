"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, serverTimestamp, Timestamp, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    X, CheckCircle2, Clock, Building2, AlertCircle, CalendarClock,
    Copy, ExternalLink, AlertTriangle, Check, FileEdit, Loader2, Link as LinkIcon, Plus
} from "lucide-react";

interface Refund {
    id: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
    paymentMethod?: string;
    createdAt?: any;
    targetUpi?: string;
    previousFailedUpi?: string;
    proofs?: {
        utr?: string;
    };
}

interface RefundDetailsPanelProps {
    refund: Refund | null;
    onClose: () => void;
}

// Strict 6-Stage Roadmap (Finalized)
const STATUS_STEPS = [
    { value: "DRAFT", label: "Entry Incomplete", icon: FileEdit, color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" },
    { value: "GATHERING_DATA", label: "Gathering Data", icon: Loader2, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { value: "CREATED", label: "Refund Initiated", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { value: "PROCESSING_AT_BANK", label: "Processing at Bank", icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { value: "SETTLED", label: "Credited / Settled", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { value: "FAILED", label: "Failed", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
];

const SLA_DAYS: Record<string, number> = {
    UPI: 2,
    WALLET: 2,
    NETBANKING: 7,
    DEBIT_CARD: 7,
    CREDIT_CARD: 7,
    COD: 5,
};

export default function RefundDetailsPanel({ refund, onClose }: RefundDetailsPanelProps) {
    const [status, setStatus] = useState("");
    const [utr, setUtr] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [refundDate, setRefundDate] = useState("");
    const [manualUpi, setManualUpi] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isManualSaving, setIsManualSaving] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedUpi, setCopiedUpi] = useState(false);

    // Derived State for Gates (The Brain)
    const [computedStatus, setComputedStatus] = useState("");

    // Initialize Local State
    useEffect(() => {
        if (refund) {
            setStatus(refund.status);
            setUtr(refund.proofs?.utr || "");
            setPaymentMethod(refund.paymentMethod || "UPI");

            if (refund.createdAt?.seconds) {
                const date = new Date(refund.createdAt.seconds * 1000);
                setRefundDate(date.toISOString().split('T')[0]);
            } else {
                setRefundDate(new Date().toISOString().split('T')[0]);
            }
        }
    }, [refund]);

    // COMPUTED STATUS LOGIC (THE BRAIN)
    useEffect(() => {
        if (!refund) return;

        // Priority 1: Draft (Missing Core Info)
        const isDraft = !paymentMethod || !refundDate;

        // Priority 2: Gathering (COD & Missing UPI)
        const isGathering = paymentMethod === 'COD' && !refund.targetUpi;

        // Determine Status based on Priorities
        let currentComputed = refund.status;

        if (isDraft) {
            currentComputed = "DRAFT";
        } else if (isGathering) {
            currentComputed = "GATHERING_DATA";
        } else if (refund.status === "GATHERING_DATA" && !isGathering) {
            // CRITICAL FIX: Auto-Promote Stale DB Status
            // We were gathering, but now have data (isGathering is false).
            // Force UI to show CREATED (Initiated) instead of stale GATHERING_DATA.
            currentComputed = "CREATED";
        } else {
            // Priority 3: Default to DB Status (Usually CREATED, PROCESSING, or SETTLED)
            currentComputed = refund.status;
        }

        setComputedStatus(currentComputed);

        // FORCE UI STATUS based on Gates
        if (isDraft) {
            setStatus("DRAFT");
        } else if (isGathering) {
            setStatus("GATHERING_DATA");
        } else {
            // We are "Free".
            // If local status is stuck in gate state, sync to the COMPUTED status (not just DB status).
            if (status === "DRAFT" || status === "GATHERING_DATA") {
                setStatus(currentComputed);
            }
        }

    }, [paymentMethod, refundDate, refund?.targetUpi, refund?.status]);


    if (!refund) return null;

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const refundRef = doc(db, "refunds", refund.id);

            const selectedDate = new Date(refundDate);
            selectedDate.setHours(12, 0, 0, 0);
            const daysToAdd = SLA_DAYS[paymentMethod] || 7;
            const dueDate = new Date(selectedDate);
            dueDate.setDate(dueDate.getDate() + daysToAdd);

            const updateData: any = {
                status: status, // This might be overridden below if Failed
                paymentMethod: paymentMethod,
                createdAt: Timestamp.fromDate(selectedDate),
                slaDueDate: dueDate.toISOString(),
                updatedAt: serverTimestamp(),
            };

            // --- THE FAILURE LOOP ---
            if (status === "FAILED") {
                // 1. Move UPI to History
                if (refund.targetUpi) {
                    updateData.previousFailedUpi = refund.targetUpi;
                    updateData.targetUpi = deleteField();
                }

                // 2. CRITICAL: Reset Status to 'CREATED' (Initiated)
                // Why? Because if it's COD, removing targetUpi automatically forces "GATHERING_DATA".
                // If it's Digital, we want to restart at "CREATED".
                updateData.status = "CREATED";
            }

            // If status is SETTLED, save the UTR
            if (status === "SETTLED" && utr) {
                updateData["proofs.utr"] = utr;
            }

            // Timeline Entry
            if (status !== refund.status || status === "FAILED") {
                const timelineResultStatus = status === "FAILED" ? "CREATED" : status;

                const timelineEntry = {
                    status: timelineResultStatus,
                    title: status === "FAILED" ? "Refund Failed & Reset" : STATUS_STEPS.find(o => o.value === status)?.label || status,
                    date: new Date().toISOString(),
                    description: status === "SETTLED" ? `UTR: ${utr}` :
                        status === "FAILED" ? "Processing failed. UPI cleared. Reverting status." :
                            "Status updated by merchant",
                };
                updateData.timeline = arrayUnion(timelineEntry);
            }

            await updateDoc(refundRef, updateData);
            onClose();

        } catch (error) {
            console.error("Error updating refund:", error);
            alert("Failed to update refund");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveManualUpi = async () => {
        if (!manualUpi || !manualUpi.includes('@')) {
            alert("Please enter a valid UPI ID (e.g. user@bank)");
            return;
        }

        setIsManualSaving(true);
        try {
            const refundRef = doc(db, "refunds", refund.id);
            await updateDoc(refundRef, {
                targetUpi: manualUpi,
                updatedAt: serverTimestamp()
                // NOTE: We do NOT need to set status manually here.
                // The "Brain" (useEffect) will see targetUpi exists, 
                // realize computedStatus is no longer GATHERING_DATA,
                // and the local status will sync to refund.status (which is CREATED).
            });
            setManualUpi("");
        } catch (error) {
            console.error("Error saving UPI:", error);
            alert("Failed to save UPI ID");
        } finally {
            setIsManualSaving(false);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/t/${refund.id}`;
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleCopyUpi = () => {
        if (refund.targetUpi) {
            navigator.clipboard.writeText(refund.targetUpi);
            setCopiedUpi(true);
            setTimeout(() => setCopiedUpi(false), 2000);
        }
    };

    // UI Helpers
    const isFailedSelected = status === "FAILED";
    const effectiveFailedUpi = isFailedSelected && refund.targetUpi ? refund.targetUpi : refund.previousFailedUpi;
    const showActiveUpi = refund.targetUpi && !isFailedSelected;
    const showMissingDetails = computedStatus === "GATHERING_DATA" || isFailedSelected;

    // Save Validation
    const isSaveDisabled = computedStatus === "DRAFT" || (status === "SETTLED" && (!utr || utr.trim() === ""));

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Refund Details</h2>
                        <p className="text-sm text-gray-400">Order #{refund.orderId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Amount Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-white/5">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Refund Amount</p>
                        <h3 className="text-3xl font-bold text-white">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refund.amount)}
                        </h3>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            {refund.customerName} ({refund.customerEmail})
                        </div>
                    </div>

                    {/* Previous Failed ID Alert */}
                    {effectiveFailedUpi && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                                    <AlertCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-red-400 mb-1">Previous Failed ID</p>
                                    <code className="text-sm text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">{effectiveFailedUpi}</code>
                                    <p className="text-[10px] text-red-400/60 mt-1">This ID failed processing. Pleaase check and retry.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payout Details Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-2">Payout Details</h4>

                        {showActiveUpi ? (
                            <div className="relative animate-in fade-in duration-300">
                                <Input
                                    label="Customer UPI ID"
                                    value={refund.targetUpi}
                                    readOnly
                                    className="pr-10"
                                />
                                <button
                                    onClick={handleCopyUpi}
                                    className="absolute right-3 top-[34px] text-gray-400 hover:text-white transition-colors"
                                    title="Copy UPI ID"
                                >
                                    {copiedUpi ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                        ) : (
                            showMissingDetails && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 animate-in fade-in duration-300">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <p className="text-xs font-medium text-yellow-400 mb-1">Payment details missing</p>
                                                <p className="text-[10px] text-gray-400 leading-relaxed">
                                                    {isFailedSelected
                                                        ? "Previous ID failed. Request new one or enter manually."
                                                        : "Customer hasn't provided details. Send link or enter manually."}
                                                </p>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 h-9"
                                                onClick={handleCopyLink}
                                            >
                                                {copiedLink ? (
                                                    <><Check size={14} className="mr-2" /> Link Copied</>
                                                ) : (
                                                    <><LinkIcon size={14} className="mr-2" /> Copy Smart Link</>
                                                )}
                                            </Button>

                                            <div className="flex items-center gap-2">
                                                <div className="h-px bg-yellow-500/20 flex-1" />
                                                <span className="text-[10px] text-yellow-500/50 font-medium uppercase">OR</span>
                                                <div className="h-px bg-yellow-500/20 flex-1" />
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder="Enter UPI manually..."
                                                        className="h-9 text-xs bg-black/20 border-yellow-500/20 focus:border-yellow-500/50"
                                                        value={manualUpi}
                                                        onChange={(e) => setManualUpi(e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="h-9 px-3 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20"
                                                    onClick={handleSaveManualUpi}
                                                    isLoading={isManualSaving}
                                                    disabled={!manualUpi}
                                                >
                                                    <Check size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Data Correction Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Payment Mode</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all appearance-none"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    {Object.keys(SLA_DAYS).map(method => (
                                        <option key={method} value={method} className="bg-[#0A0A0A] text-white">
                                            {method.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Requested On</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all [color-scheme:dark]"
                                    value={refundDate}
                                    onChange={(e) => setRefundDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Control */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-2">Update Status</h4>

                        {/* Gate Warnings */}
                        {computedStatus === "DRAFT" && (
                            <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                                <AlertCircle size={12} className="text-gray-400" />
                                Update missing Entry Details to proceed.
                            </p>
                        )}
                        {computedStatus === "GATHERING_DATA" && (
                            <p className="text-xs text-yellow-400 mb-2 flex items-center gap-2">
                                <Loader2 size={12} className="animate-spin" />
                                Waiting for customer payment details...
                            </p>
                        )}

                        <div className="grid gap-3">
                            {STATUS_STEPS.map((option) => {
                                const Icon = option.icon;
                                const isSelected = status === option.value;

                                let isDisabled = false;

                                if (computedStatus === "DRAFT") {
                                    if (option.value !== "DRAFT") isDisabled = true;
                                } else if (computedStatus === "GATHERING_DATA") {
                                    // Block Next Steps
                                    if (["CREATED", "PROCESSING_AT_BANK", "SETTLED"].includes(option.value)) isDisabled = true;
                                }

                                if (isSelected) isDisabled = false;
                                // Allow marking as Failed unless we are in Draft
                                if (computedStatus !== "DRAFT" && option.value === "FAILED") isDisabled = false;

                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => !isDisabled && setStatus(option.value)}
                                        disabled={isDisabled}
                                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${isSelected
                                            ? `${option.bg} ${option.border} ${option.color}`
                                            : isDisabled
                                                ? "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed opacity-50"
                                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        <Icon size={20} className={isSelected ? option.color : isDisabled ? "text-gray-600" : "text-gray-500"} />
                                        <span className="font-medium">{option.label}</span>
                                        {isSelected && <CheckCircle2 size={16} className={`ml-auto ${option.color}`} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Conditional UTR Input */}
                    {status === "SETTLED" && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <Input
                                label="UTR / Reference No * (Required)"
                                placeholder="e.g. CMS123456789"
                                value={utr}
                                onChange={(e) => setUtr(e.target.value)}
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-[#0A0A0A]">
                    <Button
                        className="w-full"
                        onClick={handleUpdate}
                        isLoading={isLoading}
                        disabled={isSaveDisabled}
                        className={isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        {status === "FAILED" ? "Confirm Failure & Reset" : "Save Changes"}
                    </Button>
                </div>
            </div>
        </>
    );
}
