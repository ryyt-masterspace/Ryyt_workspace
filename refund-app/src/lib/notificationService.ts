import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { isFeatureEnabled } from "@/config/features";

export interface NotificationRefundData {
    id: string;
    customerEmail: string;
    paymentMethod: string;
    amount: number;
    orderId: string;
    [key: string]: unknown;
}

/**
 * Notification Service
 * Handles branded communication and email triggers.
 */
export async function sendUpdate(
    merchantId: string,
    refundData: NotificationRefundData,
    triggerType: string,
    details: Record<string, unknown> = {}
) {
    // Phase 5 Go-Live Guard
    if (!isFeatureEnabled("ENABLE_STATUS_EMAILS")) {
        console.log("[NotificationService] Email disabled via feature flag.");
        return { success: true };
    }

    try {
        // 1. Fetch Merchant Branding Data (Robust Fetch)
        const merchantRef = doc(db, "merchants", merchantId);
        const merchantSnap = await getDoc(merchantRef);

        const branding = {
            brandName: "Ryyt",         // Default
            supportEmail: undefined,
            logo: null
        };

        if (merchantSnap.exists()) {
            const data = merchantSnap.data();
            branding.brandName = data.brandName || branding.brandName;
            branding.supportEmail = data.supportEmail || undefined;
            branding.logo = data.logo || data.brandLogo || null; // Support both field names
        }

        // 2. Prepare Email Request
        // FIX: Order ID Fallback (Handle casing mismatch)
        const safeOrderId = refundData.orderId || refundData.orderID || refundData.id?.slice(-6).toUpperCase() || "N/A";

        const payload = {
            customerEmail: refundData.customerEmail,
            merchantEmail: branding.supportEmail,
            triggerType: triggerType,
            paymentMethod: refundData.paymentMethod,
            details: {
                ...details,
                amount: refundData.amount,
                orderId: safeOrderId,
                refundId: refundData.id,
                brandName: branding.brandName,
                brandLogo: branding.logo,
                link: `${window.location.origin}/t/${refundData.id}`
            }
        };

        // 3. Get Auth Token (FIX: The Badge)
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error("[NotificationService] Cannot send email: No authenticated user.");
            return { success: false, error: "Unauthorized" };
        }
        const token = await currentUser.getIdToken();

        // 4. Call Email API
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // FIX: Added Badge
            },
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
