"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, serverTimestamp, Timestamp, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    X, CheckCircle2, Clock, Building2, AlertCircle, CalendarClock,
    Copy, ExternalLink, AlertTriangle, Check, FileEdit, Loader2, Link as LinkIcon
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

// Full 6-Step Roadmap
const STATUS_STEPS = [
    { value: "DRAFT", label: "⚠️ Entry Incomplete", icon: FileEdit, color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" },
    { value: "CREATED", label: "Refund Initiated", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { value: "GATHERING_DATA", label: "⏳ Gathering Data", icon: Loader2, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
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

const METHODS_REQUIRING_UPI = ['UPI', 'WALLET', 'COD'];

export default function RefundDetailsPanel({ refund, onClose }: RefundDetailsPanelProps) {
    const [status, setStatus] = useState("");
    const [utr, setUtr] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [refundDate, setRefundDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedUpi, setCopiedUpi] = useState(false);

    // Derived State for Gates
    const [computedStatus, setComputedStatus] = useState("");

    useEffect(() => {
        if (refund) {
            // Initialize local state
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

    // Gate Logic Effect
    useEffect(() => {
        if (!refund) return;

        // Level 1: Draft Gate
        const missingInfo = !paymentMethod || !refundDate;

        // Level 2: Gathering Gate
        const needsUpi = METHODS_REQUIRING_UPI.includes(paymentMethod);
        const upiMissing = !refund.targetUpi;
        const gathering = !missingInfo && needsUpi && upiMissing;

        // Compute Status
        let currentComputed = refund.status;
        if (missingInfo) {
            currentComputed = "DRAFT";
        } else if (gathering) {
            currentComputed = "GATHERING_DATA";
        }

        setComputedStatus(currentComputed);

        // Force Display Status based on Gates
        if (missingInfo) {
            setStatus("DRAFT");
        } else if (gathering) {
            setStatus("GATHERING_DATA");
        } else {
            // If we were forced before, revert to refund status, OR keep current selection if valid
            if (status === "DRAFT" || status === "GATHERING_DATA") {
                setStatus(refund.status === "DRAFT" || refund.status === "GATHERING_DATA" ? "CREATED" : refund.status);
            }
        }
    }, [paymentMethod, refundDate, refund?.targetUpi, refund?.status]);


    if (!refund) return null;

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const refundRef = doc(db, "refunds", refund.id);

            // Calculate new SLA Due Date
            const selectedDate = new Date(refundDate);
            selectedDate.setHours(12, 0, 0, 0);

            const daysToAdd = SLA_DAYS[paymentMethod] || 7;
            const dueDate = new Date(selectedDate);
            dueDate.setDate(dueDate.getDate() + daysToAdd);

            const updateData: any = {
                status: status,
                paymentMethod: paymentMethod,
                createdAt: Timestamp.fromDate(selectedDate),
                slaDueDate: dueDate.toISOString(),
                updatedAt: serverTimestamp(),
            };

            // Failure Logic: The Reset
            if (status === "FAILED") {
                // Move UPI to history
                if (refund.targetUpi) {
                    updateData.previousFailedUpi = refund.targetUpi;
                    updateData.targetUpi = deleteField();
                }
                // Auto-set status back to GATHERING_DATA
                updateData.status = "GATHERING_DATA";
            }

            // If status is SETTLED, save the UTR
            if (status === "SETTLED" && utr) {
                updateData["proofs.utr"] = utr;
            }

            // Add to timeline only if status changed (or we are resetting from FAILED)
            if (status !== refund.status || status === "FAILED") {
                const timelineEntry = {
                    status: status === "FAILED" ? "GATHERING_DATA" : status, // Record the resulting status
                    title: status === "FAILED" ? "Refund Failed & Reset" : STATUS_STEPS.find(o => o.value === status)?.label || status,
                    date: new Date().toISOString(),
                    description: status === "SETTLED" ? `UTR: ${utr}` :
                        status === "FAILED" ? "Processing failed. UPI cleared. Reverting to Gathering Data." :
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

    const handleCopyLink = () => {
        // UNIFIED SMART LINK
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

    // Reactive UI Logic for FAILED selection
    const isFailedSelected = status === "FAILED";
    const effectiveFailedUpi = isFailedSelected && refund.targetUpi ? refund.targetUpi : refund.previousFailedUpi;
    const showActiveUpi = refund.targetUpi && !isFailedSelected;

    // Determine if we should show the "Missing Details" box
    const showMissingDetails = computedStatus === "GATHERING_DATA" || isFailedSelected;

    // Validation Logic for Settlement
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
                                    <p className="text-[10px] text-red-400/60 mt-1">This ID failed processing. Please request a new one.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payout Details Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-2">Payout Details</h4>

                        {showActiveUpi ? (
                            // Scenario A: UPI Exists AND Not Failed
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
                            // Scenario B: UPI Missing OR Failed (Show Yellow Box)
                            showMissingDetails && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 animate-in fade-in duration-300">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-yellow-400 mb-2">Payment details missing</p>
                                            <p className="text-xs text-gray-400 mb-3">
                                                {isFailedSelected
                                                    ? "The previous UPI ID failed. Please share the link to collect a new one."
                                                    : "The customer hasn't provided their UPI ID yet."}
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                                                onClick={handleCopyLink}
                                            >
                                                {copiedLink ? (
                                                    <>
                                                        <Check size={14} className="mr-2" /> Link Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <LinkIcon size={14} className="mr-2" /> Copy Smart Link
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Data Correction Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-2">Refund Data</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
                                    Payment Mode
                                </label>
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
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
                                    Requested On
                                </label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all [color-scheme:dark]"
                                    value={refundDate}
                                    onChange={(e) => setRefundDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 ml-1">
                            Changing these will recalculate the SLA deadline.
                        </p>
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

                                // Disable Logic (The Gates)
                                let isDisabled = false;

                                if (computedStatus === "DRAFT") {
                                    if (option.value !== "DRAFT") isDisabled = true;
                                } else if (computedStatus === "GATHERING_DATA") {
                                    if (option.value === "PROCESSING_AT_BANK" || option.value === "SETTLED") isDisabled = true;
                                }

                                if (isSelected) isDisabled = false;
                                if (computedStatus !== "DRAFT" && (option.value === "FAILED" || option.value === "CREATED")) isDisabled = false;

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
                            <p className="text-xs text-gray-500 mt-2 ml-1">
                                Required for transparency. This will be shown to the customer.
                            </p>
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
