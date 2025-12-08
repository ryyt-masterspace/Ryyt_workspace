"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { X, CalendarClock } from "lucide-react";

interface CreateRefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Verified Indian Payment Matrix
const SLA_DAYS: Record<string, number> = {
    UPI: 2,
    WALLET: 2,
    NETBANKING: 7,
    DEBIT_CARD: 7,
    CREDIT_CARD: 7,
    COD: 5,
};

export default function CreateRefundModal({ isOpen, onClose, onSuccess }: CreateRefundModalProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        orderId: "",
        customerName: "",
        customerEmail: "",
        amount: "",
        paymentMethod: "UPI",
        refundDate: new Date().toISOString().split('T')[0],
    });
    const [settlementHint, setSettlementHint] = useState("");

    useEffect(() => {
        if (formData.refundDate && formData.paymentMethod) {
            const days = SLA_DAYS[formData.paymentMethod] || 7;
            const date = new Date(formData.refundDate);
            date.setDate(date.getDate() + days);

            setSettlementHint(`Expected Settlement: ${date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })}`);
        }
    }, [formData.paymentMethod, formData.refundDate]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validation: Mandatory Fields
        if (!formData.orderId || !formData.customerName || !formData.customerEmail || !formData.amount || !formData.paymentMethod || !formData.refundDate) {
            alert("Please fill in all mandatory fields.");
            return;
        }

        setIsLoading(true);
        try {
            // Check for Duplicate Order ID
            const duplicateQ = query(
                collection(db, "refunds"),
                where("merchantId", "==", user.uid),
                where("orderId", "==", formData.orderId)
            );
            const duplicateSnap = await getDocs(duplicateQ);
            if (!duplicateSnap.empty) {
                alert(`Order ID "${formData.orderId}" already exists!`);
                setIsLoading(false);
                return;
            }

            const selectedDate = new Date(formData.refundDate);
            const now = new Date();
            // Keep current time for sorting precision
            selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

            // Calculate SLA Due Date
            const daysToAdd = SLA_DAYS[formData.paymentMethod] || 7;
            const dueDate = new Date(selectedDate);
            dueDate.setDate(dueDate.getDate() + daysToAdd);

            // LOGIC FIX: Determine Initial Status
            // Only COD implies we definitely lack return details.
            // Prepaid methods (UPI, Card, etc.) start as REFUND_INITIATED.
            const isCOD = formData.paymentMethod === 'COD';
            const initialStatus = isCOD ? 'GATHERING_DATA' : 'REFUND_INITIATED';
            const timelineTitle = isCOD ? "Refund Drafted - Waiting for Details" : "Refund Initiated";

            const docRef = await addDoc(collection(db, "refunds"), {
                merchantId: user.uid,
                orderId: formData.orderId,
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                amount: Number(formData.amount),
                paymentMethod: formData.paymentMethod,
                status: initialStatus,
                createdAt: Timestamp.fromDate(selectedDate),
                slaDueDate: dueDate.toISOString(),
                timeline: [
                    {
                        status: initialStatus,
                        title: timelineTitle,
                        date: selectedDate.toISOString(),
                    },
                ],
            });

            // --- EMAIL TRIGGER START ---
            try {
                const token = await user.getIdToken(); // Get fresh token
                const emailRes = await fetch('/api/email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        to: formData.customerEmail, // Must be your verified email for testing if sandbox
                        subject: `Refund Initiated: Order #${formData.orderId}`,
                        type: initialStatus, // Pass correct status to email template
                        data: {
                            customerName: formData.customerName,
                            amount: Number(formData.amount),
                            orderId: formData.orderId,
                            trackingLink: `${window.location.origin}/t/${docRef.id}`
                        }
                    })
                });

                const emailData = await emailRes.json();

                if (!emailRes.ok) {
                    alert("EMAIL FAILED: " + (emailData.error || "Unknown Error"));
                } else {
                    alert("SUCCESS: Email sent to " + formData.customerEmail);
                }

            } catch (err) {
                console.error("Failed to send email:", err);
                alert("EMAIL FAILED: Network/Client Error");
                // We don't block the UI if email fails, just log it.
            }
            // --- EMAIL TRIGGER END ---

            onSuccess(); // <--- Trigger refresh in parent
            onClose();
            // Reset form
            setFormData({
                orderId: "",
                customerName: "",
                customerEmail: "",
                amount: "",
                paymentMethod: "UPI",
                refundDate: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Error creating refund:", error);
            alert("Failed to create refund. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-md relative bg-[#0A0A0A] border-white/10">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">New Refund</h2>
                    <p className="text-sm text-gray-400">Enter the order details below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Order ID"
                        placeholder="#ORD-1234"
                        required
                        value={formData.orderId}
                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    />
                    <Input
                        label="Customer Name"
                        placeholder="John Doe"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                    <Input
                        label="Customer Email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Amount (₹)"
                            type="number"
                            placeholder="1000"
                            required
                            min="1"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />

                        <div className="space-y-1.5 w-full">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
                                Original Payment Source
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all appearance-none"
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                >
                                    {Object.keys(SLA_DAYS).map(method => (
                                        <option key={method} value={method} className="bg-[#0A0A0A] text-white">
                                            {method.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom arrow could go here, but default is fine for now or handled by browser */}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Input
                            label="Refund Requested On"
                            type="date"
                            required
                            value={formData.refundDate}
                            onChange={(e) => setFormData({ ...formData, refundDate: e.target.value })}
                            className="[color-scheme:dark]"
                        />
                        <div className="flex items-center gap-1.5 text-xs text-blue-400 ml-1 mt-1">
                            <CalendarClock size={12} />
                            <span>{settlementHint}</span>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" isLoading={isLoading}>
                            Create Refund
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
