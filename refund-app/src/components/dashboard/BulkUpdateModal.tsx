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
    if (clean.includes('FAIL') || clean.includes('REJECT')) return 'FAILED';
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
    const [logs, setLogs] = useState<string[]>([]);

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
            const orderId = row['orderId'] || row['Order ID'];
            const rawStatus = row['newStatus'] || row['Status'];
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
                    if (item.status === 'FAILED' && item.note) {
                        updates['failureReason'] = item.note;
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

                    // 4. Trigger Email (Simulating logic from RefundDetailsPanel)
                    if (['SETTLED', 'FAILED'].includes(item.status)) {
                        const token = await user.getIdToken();
                        fetch('/api/email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                to: refundData.customerEmail,
                                triggerType: item.status === 'SETTLED' ? 'settled' : 'failed',
                                data: {
                                    customerName: refundData.customerName,
                                    amount: refundData.amount,
                                    orderId: refundData.orderId,
                                    trackLink: `${window.location.origin}/t/${docSnap.id}`,
                                    reason: item.note // Specific for FAILED
                                }
                            })
                        }).catch(e => console.error(`Email failed for ${item.orderId}`, e));
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

            setLogs(newLogs);
            alert(`Process Complete. Updated ${successCount} refunds.`);
            onSuccess();
            if (newLogs.length === 0) onClose();

        } catch (error) {
            console.error("Bulk Update Critical Failure", error);
            alert("Critical error during bulk update.");
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

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileSignature className="text-yellow-500" />
                        Bulk Status Updater
                    </h2>
                    <p className="text-sm text-gray-400">Update existing refunds via CSV.</p>
                </div>

                {!file ? (
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

                        {logs.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 max-h-32 overflow-y-auto text-xs text-red-300 font-mono">
                                {logs.map((log, i) => <div key={i}>{log}</div>)}
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
