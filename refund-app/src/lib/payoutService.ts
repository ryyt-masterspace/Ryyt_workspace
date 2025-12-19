import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateScoreboard } from "@/lib/metrics";

export type PayoutMethod = "MANUAL" | "RAZORPAY_API";

/**
 * Payout Abstraction Layer (The Universal Plug)
 * This service centralizes all settlement logic.
 */
export async function processSettlement(
    refundId: string,
    merchantId: string,
    method: PayoutMethod = "MANUAL",
    options: { utrNumber: string; extraFields?: Record<string, any> }
) {
    if (!options?.utrNumber?.trim()) {
        throw new Error("UTR/Reference number is required for settlement.");
    }
    try {
        const refundRef = doc(db, "refunds", refundId);
        const refundSnap = await getDoc(refundRef);

        if (!refundSnap.exists()) {
            throw new Error(`Refund ${refundId} not found`);
        }

        const refundData = refundSnap.data();
        const amount = Number(refundData.amount) || 0;

        if (method === "MANUAL") {
            // 1. Update Refund Status & Timeline
            const updates: any = {
                status: "SETTLED",
                timeline: arrayUnion({
                    status: "SETTLED",
                    title: "Settled Manually",
                    description: "Payment has been processed manually by the merchant.",
                    date: new Date().toISOString(),
                    note: `Settled via ${method}. UTR: ${options.utrNumber}`
                })
            };

            // Merge any extra fields and ensure UTR is recorded
            updates["proofs.utr"] = options.utrNumber;
            if (options?.extraFields) {
                Object.assign(updates, options.extraFields);
            }

            await updateDoc(refundRef, updates);

            // 2. Update Scoreboard (O(1) Metrics)
            // Note: Phase 1 updateScoreboard is guarded by its own flag inside metrics.ts
            await updateScoreboard(merchantId, "SETTLE_REFUND", amount);

            console.log(`[PayoutService] Successfully settled refund ${refundId} manually.`);
            return { success: true, method: "MANUAL" };
        }

        if (method === "RAZORPAY_API") {
            // TODO: PLACEHOLDER FOR FUTURE UPGRADE
            // This is where Razorpay API integration will go.
            // When ready, we implement the API call here.
            console.warn("[PayoutService] RAZORPAY_API method selected. This is not yet implemented.");
            throw new Error("Razorpay API payouts are not yet implemented.");
        }

        throw new Error(`Unsupported payout method: ${method}`);
    } catch (error) {
        console.error(`[PayoutService] Error processing settlement for refund ${refundId}:`, error);
        throw error;
    }
}
