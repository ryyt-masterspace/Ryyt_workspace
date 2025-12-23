import { GST_RATE } from "@/config/plans";

export interface BillBreakdown {
    subtotal: number;
    gstAmount: number;
    total: number;
}

/**
 * Single source of truth for GST calculations across the platform.
 * Ensures that Billing Page, Admin Panel, and Invoice Generator use identical logic.
 */
export function calculateFinalBill(baseAmount: number): BillBreakdown {
    const subtotal = baseAmount;
    const gstAmount = subtotal * GST_RATE;
    const total = subtotal + gstAmount;

    return {
        subtotal,
        gstAmount,
        total
    };
}
