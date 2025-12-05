"use client";

import { useState, useEffect } from "react";
import { X, Copy, ExternalLink, History, FileEdit, Loader2, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const STATUS_STEPS = [
    { value: "DRAFT", label: "Entry Incomplete", icon: FileEdit },
    { value: "GATHERING_DATA", label: "Gathering Data", icon: Loader2 },
    { value: "CREATED", label: "Refund Initiated", icon: CheckCircle2 },
    { value: "PROCESSING_AT_BANK", label: "Processing at Bank", icon: ShieldCheck },
    { value: "SETTLED", label: "Credited / Settled", icon: CheckCircle2 },
    { value: "FAILED", label: "Failed", icon: AlertTriangle },
];

const SLA_DAYS: any = {
    UPI: 2,
    WALLET: 2,
    NETBANKING: 7,
    DEBIT_CARD: 7,
    CREDIT_CARD: 7,
    COD: 5
};

export default function RefundDetailsPanel({ refund, onClose, onUpdate }: any) {
    const [status, setStatus] = useState(refund.status);
    const [paymentMethod, setPaymentMethod] = useState(refund.paymentMethod || "");
    const [refundDate, setRefundDate] = useState(refund.createdAt?.seconds ? new Date(refund.createdAt.seconds * 1000).toISOString().split('T')[0] : "");
    const [proofValue, setProofValue] = useState(refund.proofs?.utr || refund.proofs?.arn || "");
    const [isLoading, setIsLoading] = useState(false);

    // Computed Status Logic (The "Truth")
    let computedStatus = status;
    const isDraft = !paymentMethod || !refundDate;
    const needsUpi = ['UPI', 'COD', 'WALLET'].includes(paymentMethod);
    const isGathering = needsUpi && !refund.targetUpi;

    if (isDraft) {
        computedStatus = "DRAFT";
    } else if (isGathering && status !== 'FAILED') {
        computedStatus = "GATHERING_DATA";
    } else if (status === "GATHERING_DATA" && !isGathering) {
        computedStatus = "CREATED"; // Auto-promote if data arrived
    }

    // Effect: Sync local status with computed status visually
    useEffect(() => {
        if (computedStatus !== status) {
            // Only visually sync if we are "locked" in a gate
            if (computedStatus === 'DRAFT' || computedStatus === 'GATHERING_DATA') {
                setStatus(computedStatus);
            }
        }
    }, [computedStatus]); // eslint-disable-line

    const handleCopyLink = () => {
        const link = `${window.location.origin}/t/${refund.id}`;
        navigator.clipboard.writeText(link);
        alert("Smart Link copied to clipboard!");
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, "refunds", refund.id);
            const updates: any = {};
            const timelineEvent: any = {
                date: new Date().toISOString(),
            };

            // 1. Handle Status Change
            if (status !== refund.status) {
                updates.status = status;
                timelineEvent.status = status;
                timelineEvent.title = `Status updated to ${STATUS_STEPS.find(s => s.value === status)?.label}`;

                // Failure Loop Logic
                if (status === 'FAILED' && refund.targetUpi) {
                    updates.previousFailedUpi = refund.targetUpi;
                    updates.targetUpi = null; // Clear it to trigger gathering again
                    timelineEvent.title = "Refund Failed - UPI Cleared";
                }
            }

            // 2. Handle Entry Edits (Date/Method)
            if (paymentMethod !== refund.paymentMethod || refundDate !== (refund.createdAt?.seconds ? new Date(refund.createdAt.seconds * 1000).toISOString().split('T')[0] : "")) {
                updates.paymentMethod = paymentMethod;

                // Fix Date Logic
                const newDateObj = new Date(refundDate);
                updates.createdAt = newDateObj; // In real app, convert to Firestore Timestamp

                // Recalculate SLA
                if (SLA_DAYS[paymentMethod]) {
                    const slaDate = new Date(newDateObj);
                    slaDate.setDate(slaDate.getDate() + SLA_DAYS[paymentMethod]);
                    updates.slaDueDate = slaDate.toISOString();
                }
                timelineEvent.title = timelineEvent.title || "Entry Details Updated";
            }

            // 3. Handle Proof
            if (proofValue !== (refund.proofs?.utr || "")) {
                updates.proofs = { ...refund.proofs, utr: proofValue };
            }

            // Save
            await updateDoc(docRef, {
                ...updates,
                timeline: arrayUnion(timelineEvent)
            });

            onUpdate(); // Refresh Dashboard
            onClose();

        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update");
        } finally {
            setIsLoading(false);
        }
    };

    // Lock Logic
    const isSaveDisabled = (status === 'SETTLED' && !proofValue);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl h-full overflow-y-auto p-6 flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Refund Details</h2>
                        <p className="text-sm text-gray-400">Order #{refund.orderId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Status Badge */}
                <div className={`mb-6 p-3 rounded-lg border flex items-center gap-3 ${computedStatus === 'DRAFT' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        computedStatus === 'GATHERING_DATA' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                    {computedStatus === 'DRAFT' && <FileEdit className="w-5 h-5" />}
                    {computedStatus === 'GATHERING_DATA' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {(computedStatus !== 'DRAFT' && computedStatus !== 'GATHERING_DATA') && <CheckCircle2 className="w-5 h-5" />}

                    <span className="font-semibold">
                        {STATUS_STEPS.find(s => s.value === computedStatus)?.label || computedStatus}
                    </span>
                </div>

                {/* Form Fields */}
                <div className="space-y-6 flex-1">

                    {/* Entry Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Entry Details</h3>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white text-sm"
                            >
                                <option value="" disabled>Select Method</option>
                                {Object.keys(SLA_DAYS).map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Requested On</label>
                            <Input type="date" value={refundDate} onChange={(e: any) => setRefundDate(e.target.value)} />
                        </div>
                    </div>

                    {/* Payout / UPI Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Payout Details</h3>

                        {refund.previousFailedUpi && (
                            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
                                <p className="text-xs text-red-400 mb-1">Previous Failed ID:</p>
                                <p className="font-mono text-sm text-red-200">{refund.previousFailedUpi}</p>
                            </div>
                        )}

                        {refund.targetUpi ? (
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Customer UPI ID</label>
                                <div className="relative">
                                    <Input value={refund.targetUpi} readOnly className="pr-10" />
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                </div>
                            </div>
                        ) : (needsUpi && !isDraft) ? (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <p className="text-sm text-yellow-200 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Payment details missing
                                </p>
                                <Button onClick={handleCopyLink} variant="ghost" className="w-full border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20">
                                    <Copy className="w-4 h-4 mr-2" /> Copy Smart Link
                                </Button>
                            </div>
                        ) : null}
                    </div>

                    {/* Update Status */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Update Status</h3>

                        <div className="grid grid-cols-1 gap-2">
                            {STATUS_STEPS.map((step) => {
                                const isDisabled =
                                    (computedStatus === 'DRAFT' && step.value !== 'DRAFT') ||
                                    (computedStatus === 'GATHERING_DATA' && ['PROCESSING_AT_BANK', 'SETTLED'].includes(step.value));

                                return (
                                    <button
                                        key={step.value}
                                        onClick={() => !isDisabled && setStatus(step.value)}
                                        disabled={isDisabled}
                                        className={`flex items-center gap-3 p-3 rounded-md border transition-all text-left ${status === step.value
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                                : isDisabled
                                                    ? 'opacity-30 cursor-not-allowed border-transparent text-gray-500'
                                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <step.icon className="w-4 h-4" />
                                        <span className="text-sm">{step.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Proof Input */}
                    {status === 'SETTLED' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs text-blue-400 mb-1 block">UTR / Reference No * (Required)</label>
                            <Input
                                value={proofValue}
                                onChange={(e: any) => setProofValue(e.target.value)}
                                placeholder="Enter Bank Ref No..."
                                className="border-blue-500/50 focus:ring-blue-500"
                            />
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                    <Button
                        onClick={handleUpdate}
                        isLoading={isLoading}
                        disabled={isSaveDisabled}
                        className={`w-full py-3 ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {status === 'FAILED' ? "Confirm Failure & Reset" : "Save Changes"}
                    </Button>

                    {/* Audit Log */}
                    <div className="pt-4">
                        <h4 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                            <History className="w-3 h-3" /> History & Audit Log
                        </h4>
                        <div className="space-y-3 pl-2 border-l border-white/10 max-h-40 overflow-y-auto custom-scrollbar">
                            {refund.timeline && refund.timeline.slice().reverse().map((event: any, i: number) => (
                                <div key={i} className="relative pl-4">
                                    <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-gray-600'}`} />
                                    <p className="text-xs text-gray-300">{event.title || event.status}</p>
                                    <p className="text-[10px] text-gray-600 font-mono">
                                        {event.date ? new Date(event.date).toLocaleString() : 'Unknown Date'}
                                    </p>
                                </div>
                            ))}
                            {(!refund.timeline || refund.timeline.length === 0) && (
                                <p className="text-xs text-gray-600 italic pl-4">No history recorded.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
