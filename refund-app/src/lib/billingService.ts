import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PLANS, PlanType } from "../config/plans";

/**
 * calculateOverageAddon
 * Determines the excess usage cost for a billing cycle in Paise.
 * Returns the amount and the metadata (usage, limit) for recording.
 */
export async function calculateOverageAddon(merchantId: string) {
    // 1. Fetch Merchant Doc
    const merchantRef = doc(db, 'merchants', merchantId);
    const merchantSnap = await getDoc(merchantRef);
    if (!merchantSnap.exists()) throw new Error("Merchant not found");

    const merchantData = merchantSnap.data();
    const planType = (merchantData.planType || 'startup') as PlanType;
    const plan = PLANS[planType];

    // 2. Fetch Usage Metrics
    const metricsRef = doc(db, "merchants", merchantId, "metadata", "metrics");
    const metricsSnap = await getDoc(metricsRef);
    if (!metricsSnap.exists()) {
        return { amountInPaise: 0, usage: 0, limit: plan.limit, excessRate: plan.overageRate || 0 };
    }

    const usage = metricsSnap.data().totalRefundsCount || 0;
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
    const metricsRef = doc(db, "merchants", merchantId, "metadata", "metrics");
    await updateDoc(metricsRef, {
        totalRefundsCount: 0
    });
}
