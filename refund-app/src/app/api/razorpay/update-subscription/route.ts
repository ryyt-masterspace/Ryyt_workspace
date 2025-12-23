import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { PLANS } from '@/config/plans';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
    try {
        const { newPlanType, userId } = await req.json();

        if (!userId || !newPlanType) {
            return NextResponse.json({ error: 'Missing userId or newPlanType' }, { status: 400 });
        }

        const merchantRef = doc(db, 'merchants', userId);
        const merchantSnap = await getDoc(merchantRef);

        if (!merchantSnap.exists()) {
            return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
        }

        const merchantData = merchantSnap.data();
        const currentPlanType = merchantData.planType || 'startup';
        const currentPlan = PLANS[currentPlanType];
        const newPlan = PLANS[newPlanType];

        // 1. Determine if Upgrade or Downgrade
        const isUpgrade = newPlan.basePrice > currentPlan.basePrice;

        if (isUpgrade) {
            // Task 2: Immediate Upgrade
            const razorpaySubscriptionId = merchantData.razorpaySubscriptionId;
            if (!razorpaySubscriptionId) {
                return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
            }

            const planKey = `RAZORPAY_PLAN_${newPlanType.toUpperCase()}`;
            const razorpayPlanId = process.env[planKey];

            if (!razorpayPlanId) {
                return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 500 });
            }

            // Call Razorpay Update API
            await razorpay.subscriptions.update(razorpaySubscriptionId, {
                plan_id: razorpayPlanId,
                schedule_change_at: 'now' // Immediate prorated charge
            });

            // Sync Firestore
            await updateDoc(merchantRef, {
                planType: newPlanType,
                pendingPlanChange: null // Clear any pending
            });

            return NextResponse.json({ success: true, mode: 'upgrade' });
        } else {
            // Task 3: Scheduled Downgrade
            // Calculate next billing date (simplified logic: lastPaymentDate + 30 days)
            const lastPay = merchantData.lastPaymentDate?.seconds
                ? new Date(merchantData.lastPaymentDate.seconds * 1000)
                : new Date();
            const effectiveDate = new Date(lastPay);
            effectiveDate.setDate(effectiveDate.getDate() + 30);

            await updateDoc(merchantRef, {
                pendingPlanChange: {
                    newPlanType: newPlanType,
                    effectiveDate: effectiveDate
                }
            });

            return NextResponse.json({ success: true, mode: 'downgrade', effectiveDate: effectiveDate.toISOString() });
        }

    } catch (error: any) {
        console.error('Update Subscription Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
