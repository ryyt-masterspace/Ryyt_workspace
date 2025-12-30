import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc, query, where, getDocs } from 'firebase/firestore';
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
            return NextResponse.json({ message: 'No merchantId found' }, { status: 200 });
        }

        const merchantRef = doc(db, 'merchants', merchantId);

        // 2. Handle Events
        switch (eventName) {
            case 'subscription.authenticated':
                // CRITICAL SECURITY FIX: Do NOT set status to 'active' here.
                // We must wait for 'subscription.charged' to confirm the payment was actually collected.
                console.log(`[Webhook] Subscription ${subscription.id} authenticated. Waiting for charge to activate.`);
                // Optionally update ID if it changed, but usually we handle that in 'charged'
                break;

            case 'subscription.charged':
                const paymentData = payload.payment?.entity;
                const razorpayPaymentId = paymentData?.id;

                if (!razorpayPaymentId) {
                    console.error("No Payment ID in subscription.charged event");
                    return NextResponse.json({ status: 'ignored_no_payment_id' });
                }

                // Task 1: Idempotency Check
                // Check if we already recorded this payment
                const paymentsRef = collection(db, 'merchants', merchantId, 'payments');
                const q = query(paymentsRef, where("razorpayPaymentId", "==", razorpayPaymentId));
                const existingSnap = await getDocs(q);

                if (!existingSnap.empty) {
                    console.log(`[Idempotency] Payment ${razorpayPaymentId} already processed. Skipping.`);
                    return NextResponse.json({ status: 'ignored_duplicate' });
                }

                console.log(`[Billing] Processing renewal for ${merchantId}. Payment ID: ${razorpayPaymentId}`);

                // Task 2: Calculate Overage BEFORE resetting counter
                let overageData = { amountInPaise: 0, usage: 0, limit: 0, excessRate: 0 };
                try {
                    overageData = await calculateOverageAddon(merchantId);

                    // Create Add-on if needed
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
                            console.log(`[Billing] Created Overage Add-on: ₹${overageData.amountInPaise / 100}`);
                        } catch (addonError) {
                            console.error(`[Admin Critical] Failed to charge overage:`, addonError);
                        }
                    }
                } catch (calcError) {
                    console.error(`[Billing Error] Failed to calculate overage:`, calcError);
                }

                // Task 3: Plan Sync & Status Update
                // Get the plan ID from the payload and map it to our PlanType
                const rzpPlanId = subscription.plan_id;

                // Match Plan ID explicitly with Logging
                console.log("🔥 Webhook Received Plan ID:", rzpPlanId);
                console.log("🔍 Configured Startup ID:", process.env.RAZORPAY_PLAN_STARTUP);
                console.log("🔍 Configured Growth ID:", process.env.RAZORPAY_PLAN_GROWTH);
                console.log("🔍 Configured Scale ID:", process.env.RAZORPAY_PLAN_SCALE);

                const planMap: Record<string, string> = {
                    [process.env.RAZORPAY_PLAN_STARTUP || '']: 'startup',
                    [process.env.RAZORPAY_PLAN_GROWTH || '']: 'growth',
                    [process.env.RAZORPAY_PLAN_SCALE || '']: 'scale'
                };

                // Remove empty keys if env vars are missing to avoid false matches on empty strings
                delete planMap[''];

                const newPlanType = planMap[rzpPlanId];

                if (!newPlanType) {
                    console.error(`🚨 CRITICAL: Plan ID mismatch! Received: ${rzpPlanId}. Expected one of:`, Object.keys(planMap));
                } else {
                    console.log(`✅ Plan Matched: ${newPlanType}`);
                }

                // If found, this is definitive (Immediate Switch or Renewal)
                // If not found (rare), we fallback to existing or 'startup'

                const merchSnap = await getDoc(merchantRef);
                const merchData = merchSnap.data();

                const finalizedPlanType = newPlanType || merchData?.planType || 'startup';

                console.log(`[Plan Sync] Webhook Plan ID: ${rzpPlanId} -> Mapped: ${newPlanType}. Final: ${finalizedPlanType}`);

                // Logic for Downgrades: If we had a scheduled downgrade, and this charge matches the NEW lower plan, clear upcoming
                // If this charge matches the OLD plan (unlikely if change scheduled), we might have issues? 
                // Razorpay handles schedule changes by charging the NEW plan at cycle end.
                // So if we see the new plan ID here, the switch has happened.

                await updateDoc(merchantRef, {
                    subscriptionStatus: 'active',
                    lastPaymentDate: serverTimestamp(),
                    planType: finalizedPlanType,
                    upcomingPlan: null, // Clear the banner as the switch happened
                    upcomingPlanDate: null,
                    razorpaySubscriptionId: subscription.id // Task: ID Swap for Re-subscriptions
                });

                // Task 4: Record Payment
                const baseNetPrice = (paymentData?.amount || subscription.billing_amount || 0) / 100;

                await addDoc(collection(db, 'merchants', merchantId, 'payments'), {
                    amount: baseNetPrice,
                    currency: paymentData?.currency || 'INR',
                    razorpayPaymentId: razorpayPaymentId,
                    razorpaySubscriptionId: subscription.id,
                    planName: PLANS[finalizedPlanType]?.name || finalizedPlanType,
                    status: 'paid',
                    date: serverTimestamp(),
                    method: paymentData?.method || 'subscription',
                    invoiceId: `CAL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    basePrice: baseNetPrice,
                    usageCount: overageData.usage,
                    limit: overageData.limit,
                    excessRate: overageData.excessRate
                });

                // Task 5: Scoreboard Reset
                await resetMonthlyCounter(merchantId);
                break;

            case 'subscription.halted':
                await updateDoc(merchantRef, {
                    subscriptionStatus: 'suspended'
                });
                break;
            case 'subscription.cancelled':
                await updateDoc(merchantRef, {
                    subscriptionStatus: 'cancelled'
                });
                break;

            default:
                console.log('Unhandled Webhook Event:', eventName);
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error: unknown) {
        console.error('Webhook Handler Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
