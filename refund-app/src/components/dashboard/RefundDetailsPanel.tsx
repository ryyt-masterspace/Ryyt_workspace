import { useState, useEffect } from 'react';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import {
    X, CheckCircle2, AlertTriangle, Clock,
    CreditCard, Calendar, User, Mail, IndianRupee, Loader2, QrCode
} from 'lucide-react';
import QRCode from "react-qr-code";

interface RefundDetailsPanelProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refund: any;
    onClose: () => void;
    onUpdate?: () => Promise<void>;
}

export default function RefundDetailsPanel({ refund, onClose, onUpdate }: RefundDetailsPanelProps) {
    const [status, setStatus] = useState(refund.status || 'REFUND_INITIATED');
    const [proofValue, setProofValue] = useState(refund.proofValue || '');
    const [failureReason, setFailureReason] = useState(refund.failureReason || '');
    const [isSaving, setIsSaving] = useState(false);
    const [computedStatus, setComputedStatus] = useState(refund.status);
    const [showQr, setShowQr] = useState(false);

    // Initialize state and highlight logic
    useEffect(() => {
        // 1. Normalize Status for Highlighting
        const raw = (refund.status || '').toString().toUpperCase();
        let internalStatus = 'REFUND_INITIATED';

        if (raw.includes('GATHER')) internalStatus = 'GATHERING_DATA';
        else if (raw.includes('INITIATED') || raw.includes('CREATED')) internalStatus = 'REFUND_INITIATED';
        else if (raw.includes('PROCESS') || raw.includes('BANK')) internalStatus = 'PROCESSING';
        else if (raw.includes('SETTLED') || raw.includes('CREDIT') || raw.includes('DONE')) internalStatus = 'SETTLED';
        else if (raw.includes('FAIL') || raw.includes('REJECT')) internalStatus = 'FAILED';

        setStatus(internalStatus);
        setProofValue(refund.proofValue || '');
        setFailureReason(refund.failureReason || '');

        // 2. Compute Header Badge
        const needsUpi = ['COD'].includes(refund.paymentMethod);
        if (needsUpi && !refund.targetUpi && internalStatus !== 'FAILED') {
            setComputedStatus('GATHERING_DATA');
        } else {
            setComputedStatus(internalStatus);
        }
    }, [refund]);

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setIsSaving(true);

        try {
            const refundRef = doc(db, 'refunds', refund.id);
            const updateData = {
                status: status,
                lastUpdated: Timestamp.now()
            };

            if (status === 'SETTLED') (updateData as any).proofValue = proofValue;
            if (status === 'FAILED') (updateData as any).failureReason = failureReason;

            (updateData as any).timeline = arrayUnion({
                label: status === 'SETTLED' ? 'Refund Settled' :
                    status === 'FAILED' ? 'Refund Failed' :
                        status === 'PROCESSING' ? 'Processing at Bank' : 'Status Updated',
                sub: status === 'SETTLED' ? `UTR: ${proofValue}` :
                    status === 'FAILED' ? `Reason: ${failureReason}` :
                        `Updated to ${status}`,
                date: new Date().toISOString(),
                icon: status === 'SETTLED' ? 'CheckCircle2' : 'Clock'
            });

            await updateDoc(refundRef, updateData);

            // Trigger Email
            try {
                const token = await auth.currentUser.getIdToken();
                await fetch('/api/email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        triggerType: status,
                        refundId: refund.id,
                        paymentMethod: refund.paymentMethod,
                        customerEmail: refund.customerEmail,
                        merchantEmail: auth.currentUser.email,
                        details: {
                            proofValue,
                            reason: failureReason,
                            amount: refund.amount,
                            link: `${window.location.origin}/t/${refund.id}`
                        }
                    })
                });
            } catch (e) { console.error(e); }

            if (onUpdate) await onUpdate(); // <--- ADDED CALLBACK
            onClose();
        } catch (error) {
            console.error(error);
            alert("Update failed.");
        } finally {
            setIsSaving(false);
        }
    };

    const STATUS_STEPS = [
        { label: 'Gathering Data', value: 'GATHERING_DATA', icon: Loader2 },
        { label: 'Refund Initiated', value: 'REFUND_INITIATED', icon: CheckCircle2 },
        { label: 'Processing at Bank', value: 'PROCESSING', icon: Clock },
        { label: 'Credited / Settled', value: 'SETTLED', icon: CheckCircle2 },
        { label: 'Failed', value: 'FAILED', icon: AlertTriangle }
    ];

    const isStepDisabled = (stepValue: string) => stepValue === 'GATHERING_DATA';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* HEADER */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                    <div>
                        <h2 className="text-xl font-bold text-white">Refund Details</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-zinc-400 text-sm">Order #{refund.orderId}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium border bg-blue-500/10 text-blue-500 border-blue-500/20">
                                {(computedStatus || '').replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-950/50">

                    {/* Customer Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><User size={20} /></div>
                            <div>
                                <div className="text-xs text-zinc-500 uppercase font-medium">Customer</div>
                                <div className="text-sm text-white font-medium">{refund.customerName}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Mail size={20} /></div>
                            <div>
                                <div className="text-xs text-zinc-500 uppercase font-medium">Contact</div>
                                <div className="text-sm text-white font-medium break-all">{refund.customerEmail}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg text-green-500/80"><IndianRupee size={20} /></div>
                            <div>
                                <div className="text-xs text-zinc-500 uppercase font-medium">Refund Amount</div>
                                <div className="text-lg text-emerald-400 font-bold">₹{refund.amount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-500 uppercase">Payment Method</label>
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 flex items-center gap-2">
                                <CreditCard size={16} /> {refund.paymentMethod}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-500 uppercase">Requested On</label>
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 flex items-center gap-2">
                                <Calendar size={16} />
                                {new Date(refund.createdAt?.toDate ? refund.createdAt.toDate() : refund.createdAt || new Date()).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* UPI Display */}
                    {refund.targetUpi && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-500 uppercase">Customer UPI ID</label>
                            <div className="p-3 bg-zinc-900 border border-emerald-500/30 rounded-lg text-emerald-400 font-mono flex items-center justify-between">
                                {refund.targetUpi}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowQr(!showQr)}
                                        className="p-1.5 hover:bg-emerald-500/20 rounded-md transition-colors text-emerald-500"
                                        title="Scan to Pay"
                                    >
                                        <QrCode size={18} />
                                    </button>
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                </div>
                            </div>
                            {showQr && (
                                <div className="mt-3 p-4 bg-white rounded-xl flex flex-col items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <QRCode
                                        value={`upi://pay?pa=${refund.targetUpi}&pn=${encodeURIComponent(refund.customerName || '')}&am=${refund.amount}&cu=INR`}
                                        size={150}
                                        viewBox={`0 0 150 150`}
                                    />
                                    <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider text-center">
                                        Scan with any UPI App<br />to pay ₹{refund.amount}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Buttons */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Update Status</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {STATUS_STEPS.map((step) => {
                                const isDisabled = isStepDisabled(step.value);
                                const isSelected = status === step.value;
                                const StepIcon = step.icon;
                                return (
                                    <button
                                        key={step.value}
                                        onClick={() => !isDisabled && setStatus(step.value)}
                                        disabled={isDisabled}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-center h-24 ${isSelected
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg ring-1 ring-blue-400'
                                            : isDisabled
                                                ? 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                                            }`}
                                    >
                                        <StepIcon size={20} />
                                        <span className="text-xs font-medium">{step.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dynamic Inputs */}
                    {status === 'SETTLED' && (
                        <div className="space-y-2 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                            <label className="text-sm font-medium text-emerald-400">UTR / Reference Number (Required)</label>
                            <input
                                type="text"
                                value={proofValue}
                                onChange={(e) => setProofValue(e.target.value)}
                                placeholder="e.g. 3452XXXXXXXX"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                            />
                        </div>
                    )}

                    {status === 'FAILED' && (
                        <div className="space-y-2 bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                            <label className="text-sm font-medium text-red-400">Reason for Failure (Required)</label>
                            <textarea
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                                placeholder="Why was this rejected?"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-red-500 outline-none h-24 resize-none"
                            />
                        </div>
                    )}

                    {/* Audit Log */}
                    <div className="pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-2 mb-4 text-zinc-500">
                            <Clock size={14} />
                            <span className="text-xs font-medium uppercase tracking-wider">Audit Log</span>
                        </div>
                        <div className="space-y-4 pl-2 border-l border-zinc-800">
                            {(refund.timeline || []).map((event: any, idx: number) => (
                                <div key={idx} className="relative pl-4">
                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-950"></div>
                                    <div className="text-sm text-zinc-300 font-medium">{event.label}</div>
                                    <div className="text-xs text-zinc-500">{new Date(event.date).toLocaleString()}</div>
                                    {event.sub && <div className="text-xs text-zinc-500 mt-1">{event.sub}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3 z-10">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (status === 'SETTLED' && !proofValue) || (status === 'FAILED' && !failureReason)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
