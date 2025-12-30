import { db } from "./firebase";
import { doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export type MetricChangeType = "NEW_REFUND" | "SETTLE_REFUND" | "FAIL_REFUND" | "VOID_REFUND";

/**
 * updateScoreboard
 * Atomically updates the metadata metrics for a merchant.
 * Designed to be called safely; failure here does not block the primary save.
 */
export async function updateScoreboard(
    merchantId: string,
    changeType: MetricChangeType,
    amount: number
) {
    if (!merchantId) return;

    try {
        const metricsRef = doc(db, "merchants", merchantId, "metadata", "metrics");

        // Use unknown to accommodate FieldValue/Timestamp mixed types safely
        let updates: Record<string, unknown> = {
            lastUpdated: serverTimestamp(),
        };

        switch (changeType) {
            case "NEW_REFUND":
                // 1. Initial State: Always adds to Total and Active Liability (unless it starts as Failed/Settled which is rare)
                updates = {
                    ...updates,
                    totalRefundsCount: increment(1),
                    activeLiabilityAmount: increment(amount),
                };
                break;

            case "SETTLE_REFUND":
                // 2. Settlement Logic: Moves from Liability to Settled Amount
                updates = {
                    ...updates,
                    activeLiabilityAmount: increment(-amount),
                    totalSettledAmount: increment(amount),
                };
                break;

            case "FAIL_REFUND":
                // 3. Failure Logic: Moves from Liability to Stuck Amount
                updates = {
                    ...updates,
                    activeLiabilityAmount: increment(-amount),
                    stuckAmount: increment(amount),
                    failedCount: increment(1),
                };
                break;

            case "VOID_REFUND":
                // 4. Void Logic: Subtracts from Liability and Total Count
                updates = {
                    ...updates,
                    activeLiabilityAmount: increment(-amount),
                    totalRefundsCount: increment(-1),
                };
                break;
        }

        await updateDoc(metricsRef, updates);
        console.log(`[Metrics] Successfully updated ${changeType} for merchant: ${merchantId}`);

    } catch (error) {
        // CRITICAL: We catch all errors so the UI/User flow is never blocked by a metrics failure
        console.error("[Metrics Error] Failed to update scoreboard:", error);
    }
}
