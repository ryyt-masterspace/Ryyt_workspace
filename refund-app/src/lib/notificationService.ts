import { doc, getDoc, updateDoc } from "firebase/firestore";
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
                link: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL}/t/${refundData.id}`
            }
        };

        // 3. Get Auth Token
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
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = {
            success: response.ok,
            error: null as string | null
        };

        if (!response.ok) {
            const error = await response.json();
            console.error("[NotificationService] API Error:", error);
            result.error = error.error || "API Error";
        }

        // 5. ARCHITECT FIX: IMMEDIATE DB LOGGING
        // This ensures we have a paper trail in Firestore for the "Ghost Email" issue.
        try {
            const refundRef = doc(db, "refunds", refundData.id);
            await updateDoc(refundRef, {
                emailDebug: {
                    status: result.success ? 'SENT' : 'FAILED',
                    timestamp: new Date().toISOString(),
                    recipient: refundData.customerEmail,
                    trigger: triggerType,
                    error: result.error
                }
            });
        } catch (dbErr) {
            console.error("[NotificationService] Failed to log emailDebug to Firestore:", dbErr);
        }

        return result;
    } catch (error: any) {
        console.error("[NotificationService] Failed to send update:", error);
        return { success: false, error: error.message || "Unknown error" };
    }
}
