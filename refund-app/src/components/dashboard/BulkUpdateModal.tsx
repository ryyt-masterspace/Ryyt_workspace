"use client";

import { useState } from "react";
import Papa from "papaparse";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { X, Upload, FileSignature, Play, Download, AlertTriangle, CheckCircle2 } from "lucide-react";

interface BulkUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const normalizeStatus = (input: string): string | null => {
    if (!input) return null;
    const clean = input.toString().toUpperCase().trim();

    if (clean.includes('PROCESS') || clean.includes('PROGRESS')) return 'PROCESSING_AT_BANK';
    if (clean.includes('SETTLED') || clean.includes('PAID') || clean.includes('DONE')) return 'SETTLED';
    if (clean.includes('FAIL') || clean.includes('REJECT') || clean.includes('ERROR') || clean.includes('VOID')) return 'FAILED';
    if (clean.includes('GATHER') || clean.includes('INCOMPLETE')) return 'GATHERING_DATA';

    return null; // Unknown status
};

export default function BulkUpdateModal({ isOpen, onClose, onSuccess }: BulkUpdateModalProps) {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [validationSummary, setValidationSummary] = useState({ valid: 0, invalid: 0, total: 0 });
    const [isParsing, setIsParsing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultLog, setResultLog] = useState<{ success: number; errors: string[] } | null>(null);
    const [logs, setLogs] = useState<string[]>([]); // internal processing logs

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
                alert("Failed to read CSV.");
            }
        });
    };

    const validateRows = (rows: any[]) => {
        let validCount = 0;
        let invalidCount = 0;

        const processed = rows.map(row => {
            const orderId = (row['orderId'] || row['Order ID'] || '').toString().trim();
            const rawStatus = (row['newStatus'] || row['Status'] || '').toString().trim();
            const status = normalizeStatus(rawStatus);
            const note = row['note'] || row['Note'] || "";

            const isValid = !!orderId && !!status;
            if (isValid) validCount++; else invalidCount++;

            return {
                orderId,
                status,
                note,
                isValid,
                raw: row
            };
        });

        setParsedData(processed);
        setValidationSummary({ valid: validCount, invalid: invalidCount, total: rows.length });
    };

    const handleUpdate = async () => {
        if (!user || validationSummary.valid === 0) return;

        setIsUpdating(true);
        setProgress(0);
        setLogs([]);
        const validRows = parsedData.filter(r => r.isValid);
        let completed = 0;
        let successCount = 0;
        const newLogs: string[] = [];

        try {
            // Process sequentially or in small batches to respect rate limits and logic
            // Using Promise.all for speed, but individual error handling
            await Promise.all(validRows.map(async (item) => {
                try {
                    // 1. Find the Refund Doc
                    const q = query(
                        collection(db, "refunds"),
                        where("merchantId", "==", user.uid),
                        where("orderId", "==", item.orderId)
                    );
                    const snapshot = await getDocs(q);

                    if (snapshot.empty) {
                        newLogs.push(`❌ Order ${item.orderId}: Not found.`);
                        return;
                    }

                    if (snapshot.size > 1) {
                        newLogs.push(`⚠️ Order ${item.orderId}: Multiple matches found. Skipped for safety.`);
                        return;
                    }

                    const docSnap = snapshot.docs[0];
                    const refundData = docSnap.data();
                    const docRef = doc(db, "refunds", docSnap.id);
                    const now = new Date().toISOString();

                    // 2. Prepare Updates
                    const updates: any = {
                        status: item.status
                    };

                    // Extra Fields based on Status
                    if (item.status === 'SETTLED' && item.note) {
                        updates['proofs.utr'] = item.note; // Use note as UTR/Proof
                    }
                    if (item.status === 'FAILED') {
                        updates['failureReason'] = (item.note || '').toString().trim() || 'Unspecified Failure (Bulk Update)';
                    }

                    // 3. Update Firestore
                    await updateDoc(docRef, {
                        ...updates,
                        timeline: arrayUnion({
                            status: item.status,
                            title: item.status === 'SETTLED' ? 'Refund Settled (Bulk)' :
                                item.status === 'FAILED' ? 'Refund Failed' : 'Status Updated',
                            date: now,
                            note: item.note || "Bulk Update via CSV"
                        })
                    });

                    // 4. Trigger Email (ALL Statuses)
                    try {
                        const token = await user.getIdToken();
                        await fetch('/api/email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                customerEmail: refundData.customerEmail,
                                merchantEmail: user.email,
                                triggerType: item.status,
                                paymentMethod: refundData.paymentMethod,
                                details: {
                                    amount: refundData.amount,
                                    link: `${window.location.origin}/t/${docSnap.id}`,
                                    reason: item.note,      // For FAILED
                                    proofValue: item.note   // For SETTLED (UTR)
                                }
                            })
                        });
                    } catch (emailErr) {
                        console.error(`Email failed for ${item.orderId}`, emailErr);
                    }

                    successCount++;
                } catch (err) {
                    console.error(`Error updating ${item.orderId}`, err);
                    newLogs.push(`❌ Order ${item.orderId}: Update Failed.`);
                } finally {
                    completed++;
                    setProgress(Math.round((completed / validRows.length) * 100));
                }
            }));


            setResultLog({ success: successCount, errors: newLogs });
            onSuccess();
            // Do not auto-close. User must see report.

        } catch (error) {
            console.error("Bulk Update Critical Failure", error);
            setResultLog({ success: successCount, errors: [...newLogs, "CRITICAL: System error during batch processing."] });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["orderId", "newStatus", "note"];
        const sampleRow = ["#ORDER-123", "Settled", "UTR123456789 (Or Failure Reason)"];
        const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "status_update_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-lg relative bg-[#0A0A0A] border-white/10 max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
                    <X size={20} />
                </button>

                {!resultLog && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileSignature className="text-yellow-500" />
                            Bulk Status Updater
                        </h2>
                        <p className="text-sm text-gray-400">Update existing refunds via CSV.</p>
                    </div>
                )}

                {resultLog ? (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex p-3 rounded-full bg-green-500/10 text-green-500 mb-2">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Update Complete</h3>
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
                                    Error Report
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
                                <p className="text-sm text-green-400">All rows processed successfully!</p>
                            </div>
                        )}

                        <Button onClick={onClose} className="w-full bg-white/10 hover:bg-white/20">
                            Close
                        </Button>
                    </div>
                ) : !file ? (
                    <>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-yellow-500/30 transition-colors bg-white/5">
                            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                            <label className="block">
                                <span className="bg-yellow-600 text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-yellow-500 transition-colors text-sm font-bold">
                                    Select CSV File
                                </span>
                                <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                            </label>
                            <p className="text-xs text-gray-500 mt-4">
                                Columns: orderId, newStatus, note
                            </p>
                        </div>
                        <div className="flex justify-center mt-4">
                            <button onClick={handleDownloadTemplate} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white">
                                <Download size={14} /> Download Update Template
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase">Total</p>
                                <p className="text-xl font-bold text-white">{validationSummary.total}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                <p className="text-xs text-green-400 uppercase">Valid</p>
                                <p className="text-xl font-bold text-green-400">{validationSummary.valid}</p>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                <p className="text-xs text-red-400 uppercase">invalid</p>
                                <p className="text-xl font-bold text-red-400">{validationSummary.invalid}</p>
                            </div>
                        </div>

                        {isUpdating && (
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div className="bg-yellow-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button variant="ghost" onClick={() => { setFile(null); setLogs([]); }} disabled={isUpdating} className="flex-1">
                                Reset
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={isUpdating || validationSummary.valid === 0}
                                className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                            >
                                {isUpdating ? "Updating..." : (
                                    <>
                                        <Play size={16} fill="currentColor" />
                                        Update {validationSummary.valid} Refunds
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
