import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import Razorpay from 'razorpay';
import { calculateOverageAddon, resetMonthlyCounter } from '@/lib/billingService';
import { PLANS } from '@/config/plans';

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // 1. Verify Webhook Signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('Invalid Webhook Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        const { event: eventName, payload } = event;
        const subscription = payload.subscription.entity;
        const notes = subscription.notes || {};
        const merchantId = notes.merchantId;

        if (!merchantId) {
            console.warn('Webhook received without merchantId in notes:', eventName);
            return NextResponse.json({ message: 'No merchantId found' }, { status: 200 }); // Still return 200 to acknowledge
        }

        const merchantRef = doc(db, 'merchants', merchantId);

        // 2. Handle Events
        switch (eventName) {
            case 'subscription.authenticated':
            case 'subscription.charged':
                // 1. Calculate Overage before resetting
                let overageData = { amountInPaise: 0, usage: 0, limit: 0, excessRate: 0 };
                try {
                    overageData = await calculateOverageAddon(merchantId);

                    // 2. If overage exists, create a Razorpay Add-on
                    if (overageData.amountInPaise > 0) {
                        try {
                            const rzp = new Razorpay({
                                key_id: process.env.RAZORPAY_KEY_ID || '',
                                key_secret: process.env.RAZORPAY_KEY_SECRET || '',
                            });

                            await rzp.subscriptions.createAddon(subscription.id, {
                                item: {
                                    name: "Usage Overage Fee",
                                    amount: overageData.amountInPaise,
                                    currency: "INR"
                                }
                            });
                            console.log(`[Billing] Created Overage Add-on for ${merchantId}: ₹${overageData.amountInPaise / 100}`);
                        } catch (addonError) {
                            // Task 3: Log failure but don't block access
                            console.error(`[Admin Critical] Failed to create Razorpay Add-on for ${merchantId}:`, addonError);
                        }
                    }
                } catch (calcError) {
                    console.error(`[Billing Error] Failed to calculate overage for ${merchantId}:`, calcError);
                }

                // 3. Renewal Success: Update Status
                // Task 4: Webhook Switcher - Check for pending plan changes
                const merchSnap = await getDoc(merchantRef);
                const merchData = merchSnap.data();
                let actualPlanType = merchData?.planType || 'startup';

                if (merchData?.pendingPlanChange) {
                    const newType = merchData.pendingPlanChange.newPlanType;
                    console.log(`[Switcher] Detected pending change to ${newType} for ${merchantId}`);

                    try {
                        const rzp = new Razorpay({
                            key_id: process.env.RAZORPAY_KEY_ID || '',
                            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
                        });

                        const planKey = `RAZORPAY_PLAN_${newType.toUpperCase()}`;
                        const rzpPlanId = process.env[planKey];

                        if (rzpPlanId) {
                            await rzp.subscriptions.update(subscription.id, {
                                plan_id: rzpPlanId,
                                schedule_change_at: 'now'
                            });
                            actualPlanType = newType;
                            console.log(`[Switcher] Subscription updated to ${newType} in Razorpay.`);
                        }
                    } catch (switchError) {
                        console.error(`[Switcher Error] Failed to execute pending change for ${merchantId}:`, switchError);
                    }
                }

                await updateDoc(merchantRef, {
                    subscriptionStatus: 'active',
                    lastPaymentDate: serverTimestamp(),
                    planType: actualPlanType,
                    pendingPlanChange: null // Always clear after processing
                });

                // 4. Record Payment for Invoice
                const paymentData = payload.payment?.entity;
                const baseNetPrice = (paymentData?.amount || subscription.billing_amount || 0) / 100;

                await addDoc(collection(db, 'merchants', merchantId, 'payments'), {
                    amount: baseNetPrice,
                    currency: paymentData?.currency || 'INR',
                    razorpayPaymentId: paymentData?.id || 'SUB_RENEWAL',
                    razorpaySubscriptionId: subscription.id,
                    planName: PLANS[actualPlanType]?.name || actualPlanType,
                    status: 'paid',
                    date: serverTimestamp(),
                    method: paymentData?.method || 'subscription',
                    invoiceId: `CAL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    basePrice: baseNetPrice,
                    usageCount: overageData.usage,
                    limit: overageData.limit,
                    excessRate: overageData.excessRate
                });

                // 5. Scoreboard Reset: Start fresh for the new cycle
                await resetMonthlyCounter(merchantId);
                break;

            case 'subscription.halted':
            case 'subscription.cancelled':
                // Failure or Cancellation
                await updateDoc(merchantRef, {
                    subscriptionStatus: 'suspended'
                });
                break;

            default:
                console.log('Unhandled Webhook Event:', eventName);
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error: any) {
        console.error('Webhook Handler Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
