"use client";

import { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { isFeatureEnabled } from "@/config/features";
import { updateScoreboard } from "@/lib/metrics";
import { sendUpdate } from "@/lib/notificationService";
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
    const [resultLog, setResultLog] = useState<{ success: number; errors: string[] } | null>(null);

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
        let successCount = 0;
        const currentErrors: string[] = [];

        try {
            // Process sequentially to handle async queries reliably
            for (let i = 0; i < validRows.length; i++) {
                const item = validRows[i];
                const row = item.original;

                try {
                    // Check for Duplicates
                    const q = query(
                        collection(db, "refunds"),
                        where("merchantId", "==", user.uid),
                        where("orderId", "==", row['Order ID'])
                    );
                    const snapshot = await getDocs(q);

                    if (!snapshot.empty) {
                        currentErrors.push(`Row ${i + 1}: Order ${row['Order ID']} skipped (Already Exists)`);
                        continue; // Skip
                    }

                    const daysToAdd = SLA_DAYS[item.paymentMethod] || 7;
                    const now = new Date();
                    const refundDate = new Date();

                    // Calculate SLA
                    const dueDate = new Date(refundDate);
                    dueDate.setDate(dueDate.getDate() + daysToAdd);

                    const timelineTitle = item.status === 'GATHERING_DATA'
                        ? "Refund Drafted - Waiting for Details"
                        : "Refund Initiated";

                    const docRef = await addDoc(collection(db, "refunds"), {
                        merchantId: user.uid,
                        orderId: row['Order ID'],
                        customerName: row['Customer Name'],
                        customerEmail: row['Customer Email'],
                        amount: item.amount,
                        paymentMethod: item.paymentMethod,
                        status: item.status,
                        targetUpi: row['UPI ID'] || null,
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

                    // --- SCOREBOARD AGGREGATION (Conditional) ---
                    if (isFeatureEnabled("ENABLE_SCOREBOARD_AGGREGATION")) {
                        updateScoreboard(user.uid, "NEW_REFUND", item.amount);
                    }
                    // ---------------------------------------------

                    // --- EMAIL TRIGGER (Bulk via branded service) ---
                    await sendUpdate(user.uid, { id: docRef.id, ...row, amount: item.amount, customerEmail: row['Customer Email'], orderId: row['Order ID'], paymentMethod: item.paymentMethod }, item.status);
                    // -----------------------------
                    successCount++;
                } catch (rowErr) {
                    console.error("Row Error", rowErr);
                    currentErrors.push(`Row ${i + 1}: Order ${row['Order ID']} failed to create.`);
                } finally {
                    completed++;
                    setUploadProgress(Math.round((completed / validRows.length) * 100));
                }
            }

            setResultLog({ success: successCount, errors: currentErrors });
            onSuccess();
            // Do not auto-close

        } catch (error) {
            console.error("Bulk Import Critical Error:", error);
            alert("Critical System Error during import.");
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

                {!resultLog && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileSpreadsheet className="text-green-500" />
                            Bulk Import Refunds
                        </h2>
                        <p className="text-sm text-gray-400">Upload a CSV file to process multiple refunds.</p>
                    </div>
                )}

                {!file && !resultLog ? (
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

                {resultLog && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex p-3 rounded-full bg-green-500/10 text-green-500 mb-2">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Import Complete</h3>
                            <div className="flex justify-center gap-4 text-sm">
                                <span className="text-green-400 font-medium">Success: {resultLog.success}</span>
                                <span className={resultLog.errors.length > 0 ? "text-red-400 font-medium" : "text-gray-500"}>
                                    Skipped/Errors: {resultLog.errors.length}
                                </span>
                            </div>
                        </div>

                        {resultLog.errors.length > 0 ? (
                            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <AlertTriangle size={12} />
                                    Skipped / Error Log
                                </h4>
                                <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                    {resultLog.errors.map((err, i) => (
                                        <div key={i} className="text-xs text-red-300 font-mono border-b border-red-500/10 last:border-0 pb-1 last:pb-0">
                                            {err}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-lg text-center">
                                <p className="text-sm text-green-400">All rows imported successfully!</p>
                            </div>
                        )}

                        <Button onClick={onClose} className="w-full bg-white/10 hover:bg-white/20">
                            Close
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
