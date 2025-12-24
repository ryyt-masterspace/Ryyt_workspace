import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PLANS } from '@/config/plans';
import fs from 'fs';
import path from 'path';

// DEBUG LOG HELPER
const logDebug = (data: any) => {
    try {
        const logPath = path.join(process.cwd(), 'debug.log');
        const timestamp = new Date().toISOString();
        const content = `\n[${timestamp}] ${JSON.stringify(data, null, 2)}\n`;
        fs.appendFileSync(logPath, content);
    } catch (e) {
        console.error("Failed to write debug log:", e);
    }
};

// Initialize Razorpay
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

        // 1. Guard: Check for Existing Active Subscription
        const merchantRef = doc(db, 'merchants', userId);
        const merchantSnap = await getDoc(merchantRef);

        if (merchantSnap.exists()) {
            const data = merchantSnap.data();
            const status = data.subscriptionStatus; // e.g., 'active', 'created', 'cancelled', 'expired'

            // Allow if null, undefined, 'cancelled', 'expired', 'halted'
            // Block if 'active', 'authenticated' (rare but possible), 'authorized'
            const activeStatuses = ['active', 'authenticated', 'authorized'];

            if (status && activeStatuses.includes(status)) {
                console.warn(`[CreateSub] Blocked duplicate for ${userId}. Status: ${status}`);
                return NextResponse.json({
                    error: 'You already have an active subscription. Please manage it from your dashboard instead of buying a new one.'
                }, { status: 409 }); // 409 Conflict
            }
        }

        // 2. Fetch Plan ID from Env
        const planKey = `RAZORPAY_PLAN_${planType.toUpperCase()}`;
        const razorpayPlanId = process.env[planKey];

        if (!razorpayPlanId) {
            const errorMsg = `Missing Environment Variable for Plan: ${planKey}`;
            logDebug({ error: errorMsg, planKey, envKeys: Object.keys(process.env).filter(k => k.includes('RAZOR')) });
            return NextResponse.json({ error: errorMsg }, { status: 500 });
        }

        // 3. Create Subscription
        console.log(`[Razorpay] Creating subscription for Plan ID: ${razorpayPlanId} (User: ${userId})`);

        try {
            const subscription: any = await razorpay.subscriptions.create({
                plan_id: razorpayPlanId,
                total_count: 120, // 10 years
                quantity: 1,
                customer_notify: 1,
                notes: {
                    merchantId: userId
                }
            } as any);

            return NextResponse.json({
                subscriptionId: subscription.id,
                t: Date.now()
            });
        } catch (razorError: any) {
            const errorDetail = razorError.error?.description || razorError.message || 'Payment gateway error';
            console.error('[Razorpay Create Fail]', razorError);
            return NextResponse.json({ error: errorDetail }, { status: 502 });
        }

    } catch (error: any) {
        console.error("RAZORPAY_CREATE_SUBSCRIPTION_ERROR:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
