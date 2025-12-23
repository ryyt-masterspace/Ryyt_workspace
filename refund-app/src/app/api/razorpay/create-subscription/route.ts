import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PLANS } from '@/config/plans';

// Initialize Razorpay
// Note: These should be in your .env.local
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
    try {
        const { planType, userId } = await req.json();

        if (!userId || !planType) {
            return NextResponse.json({ error: 'Missing userId or planType' }, { status: 400 });
        }

        // 1. Fetch Plan ID from Env
        const planKey = `RAZORPAY_PLAN_${planType.toUpperCase()}`;
        const razorpayPlanId = process.env[planKey];

        if (!razorpayPlanId) {
            console.error(`Plan mapping missing for: ${planKey}`);
            return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 500 });
        }

        // 2. Create Subscription
        // total_count: 12 means 1 year if billed monthly
        // customer_notify: 1 means Razorpay sends emails
        // max_amount: Set mandate limit to cover base + overage
        const subscription: any = await razorpay.subscriptions.create({
            plan_id: razorpayPlanId,
            total_count: 12,
            quantity: 1,
            customer_notify: 1,
            max_amount: (PLANS[planType].maxMandateAmount || 10000) * 100, // in paise
            notes: {
                merchantId: userId
            }
        } as any);

        return NextResponse.json({
            subscriptionId: subscription.id
        });

    } catch (error: any) {
        console.error('Razorpay Subscription Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to create subscription'
        }, { status: 500 });
    }
}
