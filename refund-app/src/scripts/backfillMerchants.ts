import { db } from "../lib/firebase";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

interface BackfillSummary {
    totalProcessed: number;
    totalUpdated: number;
    status: "DRY_RUN" | "COMMITTED" | "FAILED";
}

/**
 * backfillMerchants
 * One-time script to ensure all existing merchants have the required fields:
 * planType, subscriptionStatus, and lastPaymentDate.
 */
export async function backfillMerchants(isDryRun: boolean = true): Promise<BackfillSummary> {
    console.log(`--- STARTING MERCHANT BACKFILL (${isDryRun ? "DRY RUN MODE" : "LIVE MODE"}) ---`);

    const summary: BackfillSummary = {
        totalProcessed: 0,
        totalUpdated: 0,
        status: isDryRun ? "DRY_RUN" : "COMMITTED"
    };

    try {
        const merchantsRef = collection(db, "merchants");
        const snapshot = await getDocs(merchantsRef);

        summary.totalProcessed = snapshot.size;
        console.log(`Found ${snapshot.size} merchants. Checking for missing fields...`);

        for (const merchantDoc of snapshot.docs) {
            const data = merchantDoc.data();
            const updates: Record<string, any> = {};

            if (data.planType === undefined) updates.planType = "startup";
            if (data.subscriptionStatus === undefined) updates.subscriptionStatus = "active";
            if (data.lastPaymentDate === undefined) updates.lastPaymentDate = serverTimestamp();
            if (data.logo === undefined) updates.logo = "";
            if (data.brandName === undefined) updates.brandName = "New Merchant";

            if (Object.keys(updates).length > 0) {
                summary.totalUpdated += 1;
                if (!isDryRun) {
                    console.log(`Updating merchant ${merchantDoc.id}...`, updates);
                    await updateDoc(doc(db, "merchants", merchantDoc.id), updates);
                } else {
                    console.log(`[DRY RUN] Would update merchant ${merchantDoc.id}:`, updates);
                }
            }
        }

        console.log("--- BACKFILL COMPLETE ---", summary);
        return summary;

    } catch (error) {
        console.error("--- BACKFILL FAILED ---", error);
        return { ...summary, status: "FAILED" };
    }
}
