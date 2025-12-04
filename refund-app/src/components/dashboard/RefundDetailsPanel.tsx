"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X, CheckCircle2, Clock, Building2, AlertCircle } from "lucide-react";

interface Refund {
    id: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
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

export default function RefundDetailsPanel({ refund, onClose }: RefundDetailsPanelProps) {
    const [status, setStatus] = useState("");
    const [utr, setUtr] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (refund) {
            setStatus(refund.status);
            setUtr(refund.proofs?.utr || "");
        }
    }, [refund]);

    if (!refund) return null;

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const refundRef = doc(db, "refunds", refund.id);

            const updateData: any = {
                status: status,
                updatedAt: serverTimestamp(),
            };

            // If status is SETTLED, save the UTR
            if (status === "SETTLED" && utr) {
                updateData["proofs.utr"] = utr;
            }

            // Add to timeline
            const timelineEntry = {
                status: status,
                title: STATUS_OPTIONS.find(o => o.value === status)?.label || status,
                date: new Date().toISOString(),
                description: status === "SETTLED" ? `UTR: ${utr}` : "Status updated by merchant",
            };

            await updateDoc(refundRef, {
                ...updateData,
                timeline: arrayUnion(timelineEntry)
            });

            onClose();
        } catch (error) {
            console.error("Error updating refund:", error);
            alert("Failed to update refund");
        } finally {
            setIsLoading(false);
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

                    {/* Status Control */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-300">Update Status</label>
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
                        Update Refund
                    </Button>
                </div>
            </div>
        </>
    );
}
