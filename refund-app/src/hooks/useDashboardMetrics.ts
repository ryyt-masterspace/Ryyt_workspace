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
                const q = query(
                    collection(db, "refunds"),
                    where("merchantId", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                const refunds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

                // 2. Initialize Counters
                let totalSettled = 0;
                let liability = 0;
                let breaches = 0;
                let stuckAmount = 0;
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
                        const d = refund.createdAt.seconds ? new Date(refund.createdAt.seconds * 1000) : new Date(refund.createdAt);
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
                            // refunds.length is still specific to the fetched batch, but scoreboard tracks total
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
                    totalRefunds: refunds.length,
                    slaBreachCount: breaches,
                    volumeData,
                    methodData,
                    conversionRate: refunds.length > 0 ? (refunds.filter(r => r.status === 'SETTLED').length / refunds.length) * 100 : 0,
                    recentFailures: refunds
                        .filter(r => (r.status || '').toUpperCase().includes('FAILED'))
                        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)) // Newest first
                        .slice(0, 5)
                        .map(r => ({ id: r.id, orderId: r.orderId, failureReason: r.failureReason, amount: r.amount })),

                    // New Fields
                    stuckAmount,
                    failureReasonDistribution
                });

            } catch (err: any) {
                console.error("Error calculating metrics:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, [user, volumeWindowDays]);

    return { metrics, loading, error };
}
