"use client";

import { useState } from "react";
import { writeBatch, doc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import { X, CheckCircle2, Factory, Loader2, ArrowRight } from "lucide-react";

interface BulkActionBarProps {
    selectedIds: string[];
    onClearSelection: () => void;
    onSuccess: () => void;
}

export default function BulkActionBar({ selectedIds, onClearSelection, onSuccess }: BulkActionBarProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode, setMode] = useState<'IDLE' | 'SETTLE_INPUT'>('IDLE');
    const [batchUtr, setBatchUtr] = useState("");

    if (selectedIds.length === 0) return null;

    const executeBatch = async (status: string, note: string, extraData: any = {}) => {
        setIsProcessing(true);
        try {
            const batch = writeBatch(db);
            const now = new Date().toISOString();

            selectedIds.forEach(id => {
                const ref = doc(db, "refunds", id);

                // 1. Update Main Fields
                batch.update(ref, {
                    status,
                    ...extraData
                });

                // 2. Add to Timeline
                batch.update(ref, {
                    timeline: arrayUnion({
                        status,
                        title: status === 'SETTLED' ? 'Refund Settled (Bulk)' : 'Processing at Bank (Bulk)',
                        date: now,
                        note
                    })
                });
            });

            await batch.commit();
            onSuccess();
            onClearSelection();
            setMode('IDLE');
            setBatchUtr("");
        } catch (error) {
            console.error("Batch Failed:", error);
            alert("Batch update submitted, but check console for errors.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-[#111] border border-white/10 shadow-2xl rounded-2xl p-2 flex items-center gap-4 pl-6 pr-2">

                {/* Status Text */}
                <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {selectedIds.length}
                    </div>
                    <span className="text-sm text-gray-300 font-medium">Selected</span>
                </div>

                {mode === 'IDLE' ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => executeBatch('PROCESSING_AT_BANK', 'Bulk update via Dashboard')}
                            disabled={isProcessing}
                            className="text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                        >
                            <Factory size={16} className="mr-2" /> Mark Processing
                        </Button>

                        <Button
                            onClick={() => setMode('SETTLE_INPUT')}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-500 text-white"
                        >
                            <CheckCircle2 size={16} className="mr-2" /> Mark Settled
                        </Button>

                        <button
                            onClick={onClearSelection}
                            className="ml-2 p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 animate-in fade-in">
                        <input
                            type="text"
                            placeholder="Enter Batch UTR / Ref ID..."
                            value={batchUtr}
                            onChange={(e) => setBatchUtr(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-green-500/50 w-48"
                            autoFocus
                        />
                        <Button
                            onClick={() => executeBatch('SETTLED', `Batch UTR: ${batchUtr}`, {
                                'proofs.utr': batchUtr
                            })}
                            disabled={!batchUtr || isProcessing}
                            className="bg-green-600 hover:bg-green-500"
                        >
                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setMode('IDLE')}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
