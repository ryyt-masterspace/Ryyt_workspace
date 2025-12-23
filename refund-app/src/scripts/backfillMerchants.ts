import { db } from "../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { migrateMetrics } from "./migrateMetrics";

interface BackfillSummary {
    totalProcessed: number;
    totalUpdated: number;
    status: "DRY_RUN" | "COMMITTED" | "FAILED";
}

/**
 * backfillMerchants
 * One-time script to ensure all existing merchants have the required fields:
 * planType, subscriptionStatus, and lastPaymentDate.
 * Also triggers metrics migration for each merchant.
 */
export async function backfillMerchants(isDryRun: boolean = true): Promise<BackfillSummary> {
    console.log(`--- STARTING DEEP REPAIR (${isDryRun ? "DRY RUN MODE" : "LIVE MODE"}) ---`);

    const summary: BackfillSummary = {
        totalProcessed: 0,
        totalUpdated: 0,
        status: isDryRun ? "DRY_RUN" : "COMMITTED"
    };

    try {
        const merchantsRef = collection(db, "merchants");
        const snapshot = await getDocs(merchantsRef);

        summary.totalProcessed = snapshot.size;
        console.log(`Found ${snapshot.size} merchants. Performing Deep Repair...`);

        for (const merchantDoc of snapshot.docs) {
            const data = merchantDoc.data();
            const updates: Record<string, any> = {};

            // Task 1: Field Repair
            if (data.subscriptionStatus === undefined) updates.subscriptionStatus = "active";
            if (data.planType === undefined) updates.planType = "startup";

            // Task 1: Date Repair (Use createdAt or Fallback to Now)
            if (data.lastPaymentDate === undefined) {
                updates.lastPaymentDate = data.createdAt || new Date();
            }

            // Task 4: Branding Continuity (Only set if missing, never overwrite)
            if (data.logo === undefined) updates.logo = "";
            if (data.brandName === undefined) updates.brandName = "Legacy Partner";

            if (Object.keys(updates).length > 0) {
                summary.totalUpdated += 1;
                if (!isDryRun) {
                    console.log(`[REPAIR] Updating merchant ${merchantDoc.id}...`);
                    await updateDoc(doc(db, "merchants", merchantDoc.id), updates);
                } else {
                    console.log(`[DRY RUN] Would repair merchant ${merchantDoc.id}:`, updates);
                }
            }

            // Task 1: Scoreboard Migration (Always sync if not dry run)
            if (!isDryRun) {
                console.log(`[SYNC] Triggering Metrics Migration for ${merchantDoc.id}...`);
                await migrateMetrics(false, merchantDoc.id); // Passing merchantId to migrate only this one
            }
        }

        console.log("--- DEEP REPAIR COMPLETE ---", summary);
        return summary;

    } catch (error) {
        console.error("--- DEEP REPAIR FAILED ---", error);
        return { ...summary, status: "FAILED" };
    }
}
