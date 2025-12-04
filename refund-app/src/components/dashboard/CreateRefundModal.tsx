"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

interface CreateRefundModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateRefundModal({ isOpen, onClose }: CreateRefundModalProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        orderId: "",
        customerName: "",
        customerEmail: "",
        amount: "",
        refundDate: new Date().toISOString().split('T')[0], // Default to today
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            // Create date object from the selected string (YYYY-MM-DD)
            const selectedDate = new Date(formData.refundDate);
            const now = new Date();
            // Preserve current time for better sorting, but use selected date
            selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

            await addDoc(collection(db, "refunds"), {
                merchantId: user.uid,
                orderId: formData.orderId,
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                amount: Number(formData.amount),
                status: "CREATED",
                createdAt: Timestamp.fromDate(selectedDate),
                timeline: [
                    {
                        status: "CREATED",
                        title: "Refund Initiated",
                        date: selectedDate.toISOString(),
                    },
                ],
            });
            onClose();
            setFormData({
                orderId: "",
                customerName: "",
                customerEmail: "",
                amount: "",
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
                        <Input
                            label="Refund Requested On"
                            type="date"
                            required
                            value={formData.refundDate}
                            onChange={(e) => setFormData({ ...formData, refundDate: e.target.value })}
                            className="[color-scheme:dark]"
                        />
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
