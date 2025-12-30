import { db } from "../lib/firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp, query, limit, orderBy, startAfter, where, QueryConstraint } from "firebase/firestore";

export interface MigrationSummary {
    totalRefunds: number;
    totalAmount: number;
    merchantCount: number;
    status: "DRY_RUN" | "COMMITTED" | "FAILED";
}

/**
 * migrateMetrics
 * One-time catch-up script to initialize the O(1) Scoreboard for existing data.
 * Optimized with batching (500 docs/batch) to handle large datasets safely.
 */
export async function migrateMetrics(isDryRun: boolean = true, targetMerchantId?: string): Promise<MigrationSummary> {
    console.log(`--- STARTING METRICS MIGRATION (${isDryRun ? "DRY RUN MODE" : "LIVE MODE"}) ---`);
    if (targetMerchantId) console.log(`Targeting Merchant: ${targetMerchantId}`);

    const summary: MigrationSummary = {
        totalRefunds: 0,
        totalAmount: 0,
        merchantCount: 0,
        status: isDryRun ? "DRY_RUN" : "COMMITTED"
    };

    try {
        const merchantStats: Record<string, {
            totalRefundsCount: number;
            totalSettledAmount: number;
            activeLiabilityAmount: number;
            stuckAmount: number;
            failedCount: number;
        }> = {};
        let lastDoc = null;
        let hasMore = true;
        const BATCH_SIZE = 500;

        while (hasMore) {
            console.log(`Fetching batch of ${BATCH_SIZE} refunds...`);

            let qConstraints: QueryConstraint[] = [orderBy("__name__"), limit(BATCH_SIZE)];
            if (targetMerchantId) {
                // If targeting, we filter by merchantId
                // Note: If we use where, we might need an index if combined with orderBy __name__
                // But for a single merchant, simple where is fine.
                qConstraints = [where("merchantId", "==", targetMerchantId), orderBy("__name__"), limit(BATCH_SIZE)];
            } else if (lastDoc) {
                qConstraints = [orderBy("__name__"), startAfter(lastDoc), limit(BATCH_SIZE)];
            }

            const q = query(collection(db, "refunds"), ...qConstraints);

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                hasMore = false;
                break;
            }

            console.log(`Processing batch of ${snapshot.size} refunds...`);
            snapshot.docs.forEach(d => {
                const refund = d.data();
                const mId = refund.merchantId as string;
                if (!mId) return;

                if (!merchantStats[mId]) {
                    merchantStats[mId] = {
                        totalRefundsCount: 0,
                        totalSettledAmount: 0,
                        activeLiabilityAmount: 0,
                        stuckAmount: 0,
                        failedCount: 0,
                    };
                }

                const amount = Number(refund.amount) || 0;
                const status = (refund.status || "").toString().toUpperCase();

                merchantStats[mId].totalRefundsCount += 1;
                summary.totalRefunds += 1;
                summary.totalAmount += amount;

                if (status.includes("SETTLED")) {
                    merchantStats[mId].totalSettledAmount += amount;
                } else if (status.includes("FAILED") || status.includes("REJECTED")) {
                    merchantStats[mId].stuckAmount += amount;
                    merchantStats[mId].failedCount += 1;
                } else {
                    merchantStats[mId].activeLiabilityAmount += amount;
                }
            });

            lastDoc = snapshot.docs[snapshot.size - 1];
            if (snapshot.size < BATCH_SIZE) hasMore = false;
        }

        // 3. Write Segment: Update each merchant's metadata
        const merchantIds = Object.keys(merchantStats);
        summary.merchantCount = merchantIds.length;
        console.log(`Processing totals for ${merchantIds.length} merchants...`);

        for (const mId of merchantIds) {
            console.log(`Merchant ${mId}: [Refunds: ${merchantStats[mId].totalRefundsCount}]`);

            if (isDryRun) {
                console.log(`DRY RUN: [SKIP WRITE] Merchant ${mId}`);
                continue;
            }

            const metricsRef = doc(db, "merchants", mId, "metadata", "metrics");
            await setDoc(metricsRef, {
                ...merchantStats[mId],
                lastUpdated: serverTimestamp(),
                status: "SYNCED"
            }, { merge: true });
        }

        console.log("--- MIGRATION COMPLETE ---", summary);
        return summary;

    } catch (error) {
        console.error("--- MIGRATION FAILED ---", error);
        return { ...summary, status: "FAILED" };
    }
}

// Note: This script is intended to be run in a Node environment or via a temporary admin route.
// It is NOT a client-side component.
