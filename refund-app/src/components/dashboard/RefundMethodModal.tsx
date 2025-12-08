"use client";

import { X, PenLine, FileSpreadsheet } from "lucide-react";
import Card from "@/components/ui/Card";

interface RefundMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (method: 'manual' | 'bulk') => void;
}

export default function RefundMethodModal({ isOpen, onClose, onSelect }: RefundMethodModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-lg relative bg-[#0A0A0A] border-white/10 p-8">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-white mb-2">Choose Creation Method</h2>
                    <p className="text-sm text-gray-400">How would you like to add refunds?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Manual Entry */}
                    <button
                        onClick={() => onSelect('manual')}
                        className="group flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 text-center space-y-3"
                    >
                        <div className="p-3 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-500 transition-colors">
                            <PenLine size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium mb-1">Single Entry</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Manually fill details for a single order.
                            </p>
                        </div>
                    </button>

                    {/* Bulk Import */}
                    <button
                        onClick={() => onSelect('bulk')}
                        className="group flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 text-center space-y-3"
                    >
                        <div className="p-3 rounded-full bg-green-500/10 group-hover:bg-green-500/20 text-green-500 transition-colors">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium mb-1">Bulk Import</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Upload a CSV/Excel file for multiple orders.
                            </p>
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
}
