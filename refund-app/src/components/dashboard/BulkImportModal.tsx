"use client";

import { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Play, Download } from "lucide-react";

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SLA_DAYS: Record<string, number> = {
    UPI: 2,
    WALLET: 2,
    NETBANKING: 7,
    DEBIT_CARD: 7,
    CREDIT_CARD: 7,
    COD: 5,
};

const normalizePaymentMethod = (input: string): string => {
    if (!input) return 'UPI'; // Default fallback

    // 1. Clean the string: Uppercase, Trim spaces
    const clean = input.toString().toUpperCase().trim();

    // 2. Map known variations to the Internal Enum
    if (clean.includes('DEBIT')) return 'DEBIT_CARD';
    if (clean.includes('CREDIT')) return 'CREDIT_CARD';
    if (clean.includes('NET')) return 'NETBANKING';
    if (clean.includes('COD') || clean.includes('CASH')) return 'COD';
    if (clean.includes('WALLET')) return 'WALLET';

    // 3. Default for standard codes like 'UPI'
    return clean.replace(/\s+/g, '_');
};

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [validationSummary, setValidationSummary] = useState({ valid: 0, invalid: 0, total: 0 });
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        setIsParsing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as any[];
                validateRows(rows);
                setIsParsing(false);
            },
            error: (err) => {
                console.error("CSV Parse Error:", err);
                setIsParsing(false);
                alert("Failed to read CSV file.");
            }
        });
    };

    const validateRows = (rows: any[]) => {
        let validCount = 0;
        let invalidCount = 0;
        const processed = rows.map((row, index) => {
            // Validation Logic
            const hasRequired = row['Order ID'] && row['Amount'] && row['Customer Name'] && row['Customer Email'];

            // Basic Status Logic (Same as CreateRefundModal)
            const paymentMethod = normalizePaymentMethod(row['Payment Method']);
            const isCOD = paymentMethod === 'COD';
            const targetUpi = (row['UPI ID'] || '').toString().trim();

            // Logic: 
            // 1. If we have a UPI ID (even if not strictly required by method) -> CREATED
            // 2. If COD and NO UPI -> GATHERING_DATA (Need to ask customer)
            // 3. Else (Card/Netbanking) -> CREATED
            let status = 'CREATED';
            if (targetUpi.length > 0) {
                status = 'CREATED';
            } else if (isCOD && targetUpi.length === 0) {
                status = 'GATHERING_DATA';
            }

            const isValid = hasRequired;
            if (isValid) validCount++; else invalidCount++;

            return {
                original: row,
                isValid,
                status,
                paymentMethod, // Normalized
                amount: Number(row['Amount']) || 0
            };
        });

        setParsedData(processed);
        setValidationSummary({ valid: validCount, invalid: invalidCount, total: rows.length });
    };

    const handleUpload = async () => {
        if (!user || validationSummary.valid === 0) return;

        setIsUploading(true);
        setUploadProgress(0);
        const validRows = parsedData.filter(r => r.isValid);
        let completed = 0;

        try {
            await Promise.all(validRows.map(async (item) => {
                const row = item.original;
                const daysToAdd = SLA_DAYS[item.paymentMethod] || 7;
                const now = new Date();
                const refundDate = new Date(); // Default to today for bulk import

                // Calculate SLA
                const dueDate = new Date(refundDate);
                dueDate.setDate(dueDate.getDate() + daysToAdd);

                const timelineTitle = item.status === 'GATHERING_DATA'
                    ? "Refund Drafted - Waiting for Details"
                    : "Refund Initiated";

                await addDoc(collection(db, "refunds"), {
                    merchantId: user.uid,
                    orderId: row['Order ID'],
                    customerName: row['Customer Name'],
                    customerEmail: row['Customer Email'],
                    amount: item.amount,
                    paymentMethod: item.paymentMethod,
                    status: item.status,
                    targetUpi: row['UPI ID'] || null, // Capture if provided in CSV
                    createdAt: Timestamp.fromDate(now),
                    slaDueDate: dueDate.toISOString(),
                    timeline: [
                        {
                            status: item.status,
                            title: timelineTitle,
                            date: now.toISOString(),
                            note: "Bulk Imported via CSV"
                        }
                    ]
                });
                completed++;
                setUploadProgress(Math.round((completed / validRows.length) * 100));
            }));

            // Success
            onSuccess();
            onClose();
            alert(`Successfully imported ${completed} refunds.`);
            setFile(null);
            setParsedData([]);

        } catch (error) {
            console.error("Bulk Import Error:", error);
            alert("Import failed partially. Check console.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["Order ID", "Amount", "Customer Name", "Customer Email", "Payment Method", "UPI ID"];
        const sampleRow = ["#SAMPLE-123", "1500", "John Doe", "john@example.com", "UPI", "john@okicici"];

        const csvContent = [
            headers.join(","),
            sampleRow.join(",")
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "refunds_import_template.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-lg relative bg-[#0A0A0A] border-white/10">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="text-green-500" />
                        Bulk Import Refunds
                    </h2>
                    <p className="text-sm text-gray-400">Upload a CSV file to process multiple refunds.</p>
                </div>

                {!file ? (
                    <>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-blue-500/30 transition-colors bg-white/5">
                            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                            <label className="block">
                                <span className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-500 transition-colors text-sm font-medium">
                                    Select CSV File
                                </span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-4">
                                Headers needed: Order ID, Amount, Customer Name, Customer Email, Payment Method
                            </p>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                <Download size={14} /> Download Sample CSV Template
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase">Found</p>
                                <p className="text-xl font-bold text-white">{validationSummary.total}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                <p className="text-xs text-green-400 uppercase">Valid</p>
                                <p className="text-xl font-bold text-green-400">{validationSummary.valid}</p>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                <p className="text-xs text-red-400 uppercase">Invalid</p>
                                <p className="text-xl font-bold text-red-400">{validationSummary.invalid}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {isUploading && (
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-green-500 h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => { setFile(null); setParsedData([]); }}
                                disabled={isUploading}
                                className="flex-1"
                            >
                                Reset
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading || validationSummary.valid === 0}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                {isUploading ? "Importing..." : (
                                    <>
                                        <Play size={16} fill="currentColor" />
                                        Process {validationSummary.valid} Refunds
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
