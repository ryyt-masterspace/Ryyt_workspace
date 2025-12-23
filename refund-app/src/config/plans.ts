export interface BillingPlan {
    name: string;
    basePrice: number;
    includedRefunds: number;
    excessRate: number;
    maxMandateAmount: number;
}

export const PLANS: Record<string, BillingPlan> = {
    startup: {
        name: "Startup",
        basePrice: 999,
        includedRefunds: 100,
        excessRate: 15,
        maxMandateAmount: 2500
    },
    growth: {
        name: "Growth",
        basePrice: 2499,
        includedRefunds: 300,
        excessRate: 13,
        maxMandateAmount: 6000
    },
    scale: {
        name: "Scale",
        basePrice: 4999,
        includedRefunds: 1000,
        excessRate: 12,
        maxMandateAmount: 15000
    }
};

export const GST_RATE = 0.18;

export type PlanType = keyof typeof PLANS;
