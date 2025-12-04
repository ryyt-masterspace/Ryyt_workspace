"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    X, CheckCircle2, Clock, Building2, AlertCircle, CalendarClock,
    Copy, ExternalLink, AlertTriangle, Check
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
    proofs?: {
        utr?: string;
    };
}

interface RefundDetailsPanelProps {
    refund: Refund | null;
    onClose: () => void;
}

const STATUS_OPTIONS = [
    { value: "CREATED", label: "Refund Initiated", icon: Clock },
    { value: "PROCESSING_AT_BANK", label: "Processing at Bank", icon: Building2 },
    { value: "SETTLED", label: "Settled (Credited)", icon: CheckCircle2 },
    { value: "FAILED", label: "Failed", icon: AlertCircle },
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
    const [isLoading, setIsLoading] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedUpi, setCopiedUpi] = useState(false);

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

    if (!refund) return null;

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const refundRef = doc(db, "refunds", refund.id);

            // Calculate new SLA Due Date
            const selectedDate = new Date(refundDate);
            // Preserve time from original if possible, else use noon to avoid timezone shifts
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

            // If status is SETTLED, save the UTR
            if (status === "SETTLED" && utr) {
                updateData["proofs.utr"] = utr;
            }

            // Add to timeline only if status changed
            if (status !== refund.status) {
                const timelineEntry = {
                    status: status,
                    title: STATUS_OPTIONS.find(o => o.value === status)?.label || status,
                    date: new Date().toISOString(),
                    description: status === "SETTLED" ? `UTR: ${utr}` : "Status updated by merchant",
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
        const url = `${window.location.origin}/pay/${refund.id}`;
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

                    {/* Payout Details Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-2">Payout Details</h4>

                        {refund.targetUpi ? (
                            // Scenario A: Customer provided UPI
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-green-400 mb-1">Customer provided payment details</p>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-black/30 px-2 py-1 rounded text-sm text-white font-mono">
                                                {refund.targetUpi}
                                            </code>
                                            <button
                                                onClick={handleCopyUpi}
                                                className="p-1.5 hover:bg-green-500/20 rounded-md text-green-400 transition-colors"
                                                title="Copy UPI ID"
                                            >
                                                {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Scenario B: UPI Missing
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-yellow-400 mb-2">Payment details missing</p>
                                        <p className="text-xs text-gray-400 mb-3">
                                            The customer hasn't provided their UPI ID yet. Send them the collection link.
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
                                                    <Copy size={14} className="mr-2" /> Copy Collection Link
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
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
                        <div className="grid gap-3">
                            {STATUS_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                const isSelected = status === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setStatus(option.value)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${isSelected
                                                ? "bg-blue-500/10 border-blue-500/50 text-white"
                                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        <Icon size={20} className={isSelected ? "text-blue-400" : "text-gray-500"} />
                                        <span className="font-medium">{option.label}</span>
                                        {isSelected && <CheckCircle2 size={16} className="ml-auto text-blue-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Conditional UTR Input */}
                    {status === "SETTLED" && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <Input
                                label="UTR / Reference Number"
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
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </>
    );
}
