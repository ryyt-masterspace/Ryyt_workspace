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
            const errorMsg = `Missing Environment Variable for Plan: ${planKey}`;
            logDebug({ error: errorMsg, planKey, envKeys: Object.keys(process.env).filter(k => k.includes('RAZOR')) });
            return NextResponse.json({ error: errorMsg }, { status: 500 });
        }

        // 2. Create Subscription
        console.log(`[Razorpay] Creating subscription for Plan ID: ${razorpayPlanId} (User: ${userId})`);

        try {
            const subscription: any = await razorpay.subscriptions.create({
                plan_id: razorpayPlanId,
                total_count: 12,
                quantity: 1,
                customer_notify: 1,
                // max_amount removed: not supported for fixed-amount plans
                notes: {
                    merchantId: userId
                }
            } as any);

            return NextResponse.json({
                subscriptionId: subscription.id,
                t: Date.now() // Timestamp for cache busting/verification
            });
        } catch (razorError: any) {
            logDebug({
                context: "RAZORPAY_API_CALL_FAIL",
                plan_id: razorpayPlanId,
                error: razorError
            });
            throw razorError;
        }

    } catch (error: any) {
        console.error("RAZORPAY_CREATE_SUBSCRIPTION_ERROR:", {
            message: error.message,
            description: error.description,
            errorProp: error.error,
            stack: error.stack
        });

        // Extract the most descriptive error message possible
        const errorDetail =
            error.error?.description ||
            error.description ||
            error.message ||
            'Failed to create subscription';

        return NextResponse.json({
            error: errorDetail,
            debug: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}
