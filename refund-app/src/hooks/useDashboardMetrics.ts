import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export interface DashboardMetrics {
    totalSettledAmount: number;
    activeLiability: number;
    totalRefunds: number;
    slaBreachCount: number;
    volumeData: { date: string; count: number }[];
    methodData: { name: string; value: number }[];
    conversionRate: number; // Extra: Settled vs Total
    recentFailures: { id: string; orderId: string; failureReason: string; amount: number }[];
}

export function useDashboardMetrics() {
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
                const methodCounts: Record<string, number> = {};
                const dateCounts: Record<string, number> = {};

                // Helper for Date Bucketing (Last 14 Days)
                const today = new Date();
                // Initialize last 14 days with 0 to ensure continuity in charts
                for (let i = 13; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }); // DD/MM
                    dateCounts[key] = 0;
                }

                // 3. Process Logic
                console.log("DEBUG: Processing refunds...", refunds.length);

                refunds.forEach(doc => {
                    const refund = doc; // In this correct variable name as per previous map

                    // 1. NORMALIZE STATUS
                    const status = (refund.status || '').toString().toUpperCase().trim();

                    // 2. NORMALIZE AMOUNT
                    const rawAmount = refund.amount;
                    const amount = Number(rawAmount) || 0;

                    // 3. DEBUG LOG
                    console.log(`DEBUG Check: ID=${refund.id}, Status='${status}', Amount=${amount}`);

                    // A. Financials
                    if (status.includes('SETTLED')) {
                        console.log('Found Settled Item:', { id: refund.id, rawAmount, parsedAmount: amount });
                        totalSettled += amount;
                    } else {
                        // Calculate Active Liability (Not Settled AND Not Failed)
                        if (!status.includes('FAILED') && !status.includes('REJECTED')) {
                            liability += amount;
                        }
                    }

                    // B. SLA Breaches
                    if (!status.includes('SETTLED') && !status.includes('FAILED') && !status.includes('REJECTED') && refund.slaDueDate) {
                        if (new Date() > new Date(refund.slaDueDate)) {
                            breaches++;
                        }
                    }

                    // C. Method Distribution
                    const method = refund.paymentMethod || 'Unknown';
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

                // 4. Transform for Recharts
                const volumeData = Object.entries(dateCounts).map(([date, count]) => ({
                    date,
                    count
                }));

                const methodData = Object.entries(methodCounts).map(([name, value]) => ({
                    name: name.replace('_', ' '), // Clean up labels (e.g. CREDIT_CARD -> CREDIT CARD)
                    value
                }));

                console.log("DEBUG: Final Calculation -> Settled:", totalSettled, "Liability:", liability);

                setMetrics({
                    totalSettledAmount: totalSettled,
                    activeLiability: liability,
                    totalRefunds: refunds.length,
                    slaBreachCount: breaches,
                    volumeData,
                    methodData,
                    conversionRate: refunds.length > 0 ? (refunds.filter(r => r.status === 'SETTLED').length / refunds.length) * 100 : 0,
                    recentFailures: refunds.filter(r => r.status === 'FAILED').map(r => ({ id: r.id, orderId: r.orderId, failureReason: r.failureReason, amount: r.amount }))
                });

            } catch (err: any) {
                console.error("Error calculating metrics:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, [user]);

    return { metrics, loading, error };
}
