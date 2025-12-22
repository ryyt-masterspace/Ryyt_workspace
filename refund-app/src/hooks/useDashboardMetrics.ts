import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { isFeatureEnabled } from "@/config/features";

export interface DashboardMetrics {
    totalSettledAmount: number;
    activeLiability: number;
    totalRefunds: number;
    slaBreachCount: number;
    volumeData: { date: string; count: number }[];
    methodData: { name: string; value: number }[];
    conversionRate: number; // Extra: Settled vs Total
    recentFailures: { id: string; orderId: string; failureReason: string; amount: number }[];

    // New Failure Metrics
    stuckAmount: number;
    failureReasonDistribution: { name: string; value: number }[];
}

interface RefundData {
    id: string;
    merchantId: string;
    status?: string;
    amount?: number | string;
    failureReason?: string;
    slaDueDate?: string;
    paymentMethod?: string;
    createdAt?: { seconds: number } | string;
    [key: string]: unknown; // Allow other fields but keep it safe
}

export function useDashboardMetrics(volumeWindowDays: number = 30) {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMetrics() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch ALL refunds for the merchant

                // ... inside fetchMetrics ...
                const q = query(
                    collection(db, "refunds"),
                    where("merchantId", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                const refunds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RefundData));

                let totalSettled = 0;
                let liability = 0;
                let breaches = 0;
                let stuckAmount = 0;
                let totalRefundsCount = refunds.length;

                const methodCounts: Record<string, number> = {};
                const dateCounts: Record<string, number> = {};
                const failureReasonCounts: Record<string, number> = {};

                // Helper for Date Bucketing (Dynamic Window)
                const today = new Date();
                // Initialize last X days with 0 to ensure continuity in charts
                for (let i = volumeWindowDays - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }); // DD/MM
                    dateCounts[key] = 0;
                }

                // 3. Process Logic
                refunds.forEach(doc => {
                    const refund = doc;
                    const status = (refund.status || '').toString().toUpperCase().trim();
                    const rawAmount = refund.amount;
                    const amount = Number(rawAmount) || 0;

                    // A. Financials (Fallback calculation)
                    if (status.includes('SETTLED')) {
                        totalSettled += amount;
                    } else if (status.includes('FAILED') || status.includes('REJECTED')) {
                        stuckAmount += amount;
                        let reason = (refund.failureReason || 'Unspecified').trim();
                        reason = reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase();
                        failureReasonCounts[reason] = (failureReasonCounts[reason] || 0) + 1;
                    } else {
                        liability += amount;
                    }

                    // B. SLA Breaches
                    if (!status.includes('SETTLED') && !status.includes('FAILED') && !status.includes('REJECTED') && refund.slaDueDate) {
                        if (new Date() > new Date(refund.slaDueDate)) {
                            breaches++;
                        }
                    }

                    // C. Method Distribution
                    const rawMethod = refund.paymentMethod || 'Unknown';
                    const method = rawMethod.toString().toUpperCase().replace(/_/g, ' ');
                    methodCounts[method] = (methodCounts[method] || 0) + 1;

                    // D. Volume Trends
                    if (refund.createdAt) {
                        let d: Date;
                        if (typeof refund.createdAt === 'object' && refund.createdAt !== null && 'seconds' in refund.createdAt) {
                            d = new Date((refund.createdAt as { seconds: number }).seconds * 1000);
                        } else {
                            d = new Date(refund.createdAt as string);
                        }

                        const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
                        if (dateCounts.hasOwnProperty(key)) {
                            dateCounts[key]++;
                        }
                    }
                });

                // 4. O(1) OVERRIDE (Conditional)
                // If enabled, we overwrite the calculated totals with pre-aggregated metadata
                if (isFeatureEnabled("ENABLE_SCOREBOARD_AGGREGATION")) {
                    try {
                        const metricsRef = doc(db, "merchants", user.uid, "metadata", "metrics");
                        const mSnap = await getDoc(metricsRef);
                        if (mSnap.exists()) {
                            const data = mSnap.data();
                            console.log("[Dashboard] Using O(1) Pre-aggregated Metrics");
                            totalSettled = data.totalSettledAmount ?? totalSettled;
                            liability = data.activeLiabilityAmount ?? liability;
                            stuckAmount = data.stuckAmount ?? stuckAmount;
                            totalRefundsCount = data.totalRefundsCount ?? totalRefundsCount;
                        }
                    } catch (mErr) {
                        console.error("O(1) Metrics fetch failed, falling back to calculation", mErr);
                    }
                }

                // 5. Transform for Recharts
                const volumeData = Object.entries(dateCounts).map(([date, count]) => ({
                    date,
                    count
                }));

                const methodData = Object.entries(methodCounts).map(([name, value]) => ({
                    name,
                    value
                }));

                const failureReasonDistribution = Object.entries(failureReasonCounts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value); // Sort desc (No limit)

                setMetrics({
                    totalSettledAmount: totalSettled,
                    activeLiability: liability,
                    totalRefunds: totalRefundsCount,
                    slaBreachCount: breaches,
                    volumeData,
                    methodData,
                    conversionRate: refunds.length > 0 ? (refunds.filter(r => r.status === 'SETTLED').length / refunds.length) * 100 : 0,
                    recentFailures: refunds
                        .filter(r => (r.status || '').toString().toUpperCase().includes('FAILED'))
                        .sort((a, b) => {
                            const timeA = (typeof a.createdAt === 'object' && a.createdAt && 'seconds' in a.createdAt)
                                ? (a.createdAt as { seconds: number }).seconds
                                : 0;
                            const timeB = (typeof b.createdAt === 'object' && b.createdAt && 'seconds' in b.createdAt)
                                ? (b.createdAt as { seconds: number }).seconds
                                : 0;
                            return timeB - timeA;
                        }) // Newest first
                        .slice(0, 5)
                        .map(r => ({
                            id: r.id,
                            orderId: r.orderId as string || 'N/A',
                            failureReason: r.failureReason || 'Unknown',
                            amount: Number(r.amount) || 0
                        })),

                    // New Fields
                    stuckAmount,
                    failureReasonDistribution
                });

            } catch (err: unknown) {
                console.error("Error calculating metrics:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, [user, volumeWindowDays]);

    return { metrics, loading, error };
}
