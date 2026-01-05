import { adminDb } from "./firebaseAdmin";
import { PLANS, PlanType } from "../config/plans";

/**
 * calculateOverageAddon
 * Determines the excess usage cost for a billing cycle in Paise.
 * Returns the amount and the metadata (usage, limit) for recording.
 */
export async function calculateOverageAddon(merchantId: string) {
    // 1. Fetch Merchant Doc
    const merchantSnap = await adminDb.collection('merchants').doc(merchantId).get();
    if (!merchantSnap.exists) throw new Error("Merchant not found");

    const merchantData = merchantSnap.data();
    if (!merchantData) throw new Error("Merchant data is empty");

    const planType = (merchantData.planType || 'startup') as PlanType;
    const plan = PLANS[planType];

    // 2. Fetch Usage Metrics
    const metricsSnap = await adminDb.collection("merchants").doc(merchantId).collection("metadata").doc("metrics").get();
    if (!metricsSnap.exists) {
        return { amountInPaise: 0, usage: 0, limit: plan.limit, excessRate: plan.overageRate || 0 };
    }

    const usage = metricsSnap.data()?.totalRefundsCount || 0;
    const overageCount = Math.max(0, usage - (plan.limit || 0));

    // Amount in Paise (INR * 100)
    const rate = plan.overageRate || 0;
    const amountInPaise = overageCount * rate * 100;

    return {
        amountInPaise,
        usage,
        limit: plan.limit,
        excessRate: rate
    };
}

/**
 * resetMonthlyCounter
 * Resets the refund scoreboard to 0 for the new billing cycle.
 */
export async function resetMonthlyCounter(merchantId: string) {
    const metricsRef = adminDb.collection("merchants").doc(merchantId).collection("metadata").doc("metrics");
    await metricsRef.update({
        totalRefundsCount: 0
    });
}
