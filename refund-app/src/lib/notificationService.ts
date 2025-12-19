import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isFeatureEnabled } from "@/config/features";

/**
 * Notification Service
 * Handles branded communication and email triggers.
 */
export async function sendUpdate(
    merchantId: string,
    refundData: any,
    triggerType: string,
    details: any = {}
) {
    // Phase 5 Go-Live Guard
    if (!isFeatureEnabled("ENABLE_STATUS_EMAILS")) {
        console.log("[NotificationService] Email disabled via feature flag.");
        return { success: true };
    }

    try {
        // 1. Fetch Merchant Branding Data
        const merchantRef = doc(db, "merchants", merchantId);
        const merchantSnap = await getDoc(merchantRef);

        const branding = {
            brandName: "Ryyt", // Fallback
            logo: null
        };

        if (merchantSnap.exists()) {
            const data = merchantSnap.data();
            branding.brandName = data.brandName || branding.brandName;
            branding.logo = data.logo || null;
        }

        // 2. Prepare Email Request
        // We pass branding info so the API can personalize the template
        const payload = {
            customerEmail: refundData.customerEmail,
            merchantEmail: branding.brandName, // Used for reply-to or context
            triggerType: triggerType,
            paymentMethod: refundData.paymentMethod,
            details: {
                ...details,
                amount: refundData.amount,
                orderId: refundData.orderId,
                refundId: refundData.id,
                brandName: branding.brandName,
                brandLogo: branding.logo,
                link: `${window.location.origin}/t/${refundData.id}`
            }
        };

        // 3. Call Email API
        // Note: This logic assumes it's called from a client-side component 
        // with access to the window/origin.
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("[NotificationService] API Error:", error);
            return { success: false, error: error.error };
        }

        return { success: true };
    } catch (error) {
        console.error("[NotificationService] Failed to send update:", error);
        return { success: false, error };
    }
}
