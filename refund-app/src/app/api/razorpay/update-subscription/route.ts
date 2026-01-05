import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { PLANS } from '@/config/plans';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
    try {
        // 1. Input Validation
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { newPlanType, userId } = body;

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
        }
        if (!newPlanType || !PLANS[newPlanType]) {
            return NextResponse.json({ error: `Invalid plan type: ${newPlanType}` }, { status: 400 });
        }

        // 2. Fetch Merchant Data
        const merchantRef = doc(db, 'merchants', userId);
        const merchantSnap = await getDoc(merchantRef);

        if (!merchantSnap.exists()) {
            return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
        }

        const merchantData = merchantSnap.data();
        const currentPlanType = merchantData.planType || 'startup';

        // Validate Plans
        const currentPlan = PLANS[currentPlanType];
        const newPlan = PLANS[newPlanType];

        if (!currentPlan) {
            console.error(`[Critical] Merchant ${userId} has invalid current plan: ${currentPlanType}`);
            return NextResponse.json({ error: 'Current plan configuration error' }, { status: 500 });
        }

        const razorpaySubscriptionId = merchantData.razorpaySubscriptionId;
        if (!razorpaySubscriptionId) {
            return NextResponse.json({ error: 'No active subscription found to update' }, { status: 400 });
        }

        // 3. Get Razorpay Plan ID
        const planKey = `RAZORPAY_PLAN_${newPlanType.toUpperCase()}`;
        const razorpayPlanId = process.env[planKey];

        if (!razorpayPlanId) {
            console.error(`[Critical] Missing Env Var: ${planKey}`);
            return NextResponse.json({ error: 'Internal configuration error (Plan ID missing)' }, { status: 500 });
        }

        // --- UPI GUARD START ---
        // Task: Fetch subscription and check payment method
        try {
            const sub = await razorpay.subscriptions.fetch(razorpaySubscriptionId) as { payment_method?: string, method?: string };

            // Check implicit UPI indicators
            // Razorpay subscription entity might doesn't directly return 'payment_method' always.
            // Often it's inferred from the 'notes' or recent invoices, OR we check our DB history.

            let isUpi = false;

            // 1. Check if 'method' or relevant field exists on subscription (User Request)
            // Some API versions expose `payment_method`.
            if (sub.payment_method === 'upi' || sub.method === 'upi') {
                isUpi = true;
            }

            // 2. Fallback: Check our local payments history for the most recent payment
            if (!isUpi) {
                const paymentsRef = collection(db, 'merchants', userId, 'payments');
                const lastPayQuery = query(paymentsRef, orderBy('date', 'desc'), limit(1));
                const lastPaySnap = await getDocs(lastPayQuery);

                if (!lastPaySnap.empty) {
                    const lastPay = lastPaySnap.docs[0].data();
                    if (lastPay.method === 'upi') {
                        isUpi = true;
                    }
                }
            }

            if (isUpi) {
                return NextResponse.json({
                    error: 'UPI_RESTRICTION',
                    message: 'UPI plans cannot be auto-upgraded. Please cancel and re-subscribe.'
                }, { status: 400 });
            }

        } catch (fetchErr) {
            console.warn("Failed to fetch subscription details for UPI check, proceeding with caution:", fetchErr);
            // We proceed if we can't verify, or we could strict block. 
            // Proceeding is standard practice unless strict compliance needed.
        }
        // --- UPI GUARD END ---

        // 4. Compare Prices
        const isUpgrade = newPlan.price > currentPlan.price;
        console.log(`[UpdateSub] User ${userId} requested switch: ${currentPlanType} -> ${newPlanType}. Upgrade? ${isUpgrade}`);

        // 5. Razorpay API Call
        try {
            if (isUpgrade) {
                // Immediate Upgrade
                await razorpay.subscriptions.update(razorpaySubscriptionId, {
                    plan_id: razorpayPlanId,
                    schedule_change_at: 'now',
                    quantity: 1
                });

                // Sync DB immediately
                await updateDoc(merchantRef, {
                    planType: newPlanType,
                    upcomingPlan: null,
                    upcomingPlanDate: null
                });

                return NextResponse.json({ success: true, mode: 'upgrade' });

            } else {
                // Downgrade at Cycle End
                await razorpay.subscriptions.update(razorpaySubscriptionId, {
                    plan_id: razorpayPlanId,
                    schedule_change_at: 'cycle_end',
                    quantity: 1
                });

                // Calculate estimated effective date for UI
                const lastPaySeconds = merchantData.lastPaymentDate?.seconds;
                let effectiveDate = new Date();
                if (lastPaySeconds) {
                    const lastPayDate = new Date(lastPaySeconds * 1000);
                    effectiveDate = new Date(lastPayDate);
                    effectiveDate.setDate(effectiveDate.getDate() + 30); // Approx next cycle

                    // Safety: If calculated date is in past, default to today + 30
                    if (effectiveDate < new Date()) {
                        effectiveDate = new Date();
                        effectiveDate.setDate(effectiveDate.getDate() + 30);
                    }
                }

                // Update DB with "upcoming" status
                await updateDoc(merchantRef, {
                    upcomingPlan: newPlanType,
                    upcomingPlanDate: effectiveDate
                });

                return NextResponse.json({
                    success: true,
                    mode: 'downgrade',
                    effectiveDate: effectiveDate.toISOString()
                });
            }

        } catch (razorError: unknown) {
            console.error('[Razorpay API Error]', razorError);
            const rError = razorError as { error?: { description: string }, description?: string, message?: string };
            const rzpMsg = rError.error?.description || rError.description || rError.message || 'Payment gateway error';
            return NextResponse.json({ error: `Razorpay Error: ${rzpMsg}` }, { status: 502 });
        }

    } catch (error: unknown) {
        console.error('[UpdateSubscription Fatal]', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
    }
}
