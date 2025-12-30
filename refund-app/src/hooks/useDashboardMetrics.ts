import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
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
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "refunds"),
            where("merchantId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            try {
                const refunds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RefundData));

                let totalSettled = 0;
                let liability = 0;
                let breaches = 0;
                let stuckAmount = 0;
                let totalRefundsCount = refunds.length;

                const methodCounts: Record<string, number> = {};
                const dateCounts: Record<string, number> = {};
                const failureReasonCounts: Record<string, number> = {};

                const today = new Date();
                for (let i = volumeWindowDays - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
                    dateCounts[key] = 0;
                }

                refunds.forEach(refund => {
                    const status = (refund.status || '').toString().toUpperCase().trim();
                    const amount = Number(refund.amount) || 0;

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

                    if (!status.includes('SETTLED') && !status.includes('FAILED') && !status.includes('REJECTED') && refund.slaDueDate) {
                        if (new Date() > new Date(refund.slaDueDate)) breaches++;
                    }

                    const rawMethod = refund.paymentMethod || 'Unknown';
                    const method = rawMethod.toString().toUpperCase().replace(/_/g, ' ');
                    methodCounts[method] = (methodCounts[method] || 0) + 1;

                    if (refund.createdAt) {
                        let d: Date;
                        if (typeof refund.createdAt === 'object' && refund.createdAt !== null && 'seconds' in refund.createdAt) {
                            d = new Date((refund.createdAt as { seconds: number }).seconds * 1000);
                        } else {
                            d = new Date(refund.createdAt as string);
                        }
                        const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
                        if (dateCounts.hasOwnProperty(key)) dateCounts[key]++;
                    }
                });

                // O(1) Override
                if (isFeatureEnabled("ENABLE_SCOREBOARD_AGGREGATION")) {
                    const metricsRef = doc(db, "merchants", user.uid, "metadata", "metrics");
                    const mSnap = await getDoc(metricsRef);
                    if (mSnap.exists()) {
                        const data = mSnap.data();
                        totalSettled = data.totalSettledAmount ?? totalSettled;
                        liability = data.activeLiabilityAmount ?? liability;
                        stuckAmount = data.stuckAmount ?? stuckAmount;
                        totalRefundsCount = data.totalRefundsCount ?? totalRefundsCount;
                    }
                }

                setMetrics({
                    totalSettledAmount: totalSettled,
                    activeLiability: liability,
                    totalRefunds: totalRefundsCount,
                    slaBreachCount: breaches,
                    volumeData: Object.entries(dateCounts).map(([date, count]) => ({ date, count })),
                    methodData: Object.entries(methodCounts).map(([name, value]) => ({ name, value })),
                    conversionRate: refunds.length > 0 ? (refunds.filter(r => r.status === 'SETTLED').length / refunds.length) * 100 : 0,
                    recentFailures: refunds
                        .filter(r => (r.status || '').toString().toUpperCase().includes('FAILED'))
                        .sort((a, b) => {
                            const timeA = (typeof a.createdAt === 'object' && a.createdAt && 'seconds' in a.createdAt) ? (a.createdAt as { seconds: number }).seconds : 0;
                            const timeB = (typeof b.createdAt === 'object' && b.createdAt && 'seconds' in b.createdAt) ? (b.createdAt as { seconds: number }).seconds : 0;
                            return timeB - timeA;
                        })
                        .slice(0, 5)
                        .map(r => ({
                            id: r.id,
                            orderId: r.orderId as string || 'N/A',
                            failureReason: r.failureReason || 'Unknown',
                            amount: Number(r.amount) || 0
                        })),
                    stuckAmount,
                    failureReasonDistribution: Object.entries(failureReasonCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
                });
            } catch (err: unknown) {
                console.error("Dashboard Metrics Aggregation Error:", err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [user, volumeWindowDays]);

    return { metrics, loading, error };
}
