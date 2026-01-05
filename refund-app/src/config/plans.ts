export interface BillingPlan {
    key: string;
    name: string;
    price: number;
    originalPrice: number;
    setupFee: number;
    limit: number;
    overageRate: null;
}

export const PLANS: Record<string, BillingPlan> = {
    startup: {
        key: 'startup',
        name: 'Startup',
        price: 1999,
        originalPrice: 2499,
        setupFee: 4999,
        limit: 150,
        overageRate: null
    },
    growth: {
        key: 'growth',
        name: 'Growth',
        price: 3999,
        originalPrice: 4999,
        setupFee: 4999,
        limit: 400,
        overageRate: null
    },
    scale: {
        key: 'scale',
        name: 'Scale',
        price: 7999,
        originalPrice: 9999,
        setupFee: 4999,
        limit: 1000,
        overageRate: null
    }
};

export const GST_RATE = 0.18;

export type PlanType = keyof typeof PLANS;
