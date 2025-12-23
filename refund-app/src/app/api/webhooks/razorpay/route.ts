import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

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
                // Renewal or Initial Success
                await updateDoc(merchantRef, {
                    subscriptionStatus: 'active',
                    lastPaymentDate: serverTimestamp(),
                });

                // Record Payment for Invoice
                const paymentData = payload.payment?.entity;
                await addDoc(collection(db, 'merchants', merchantId, 'payments'), {
                    amount: (paymentData?.amount || subscription.billing_amount || 0) / 100, // Razorpay is in paise
                    currency: paymentData?.currency || 'INR',
                    razorpayPaymentId: paymentData?.id || 'SUB_RENEWAL',
                    razorpaySubscriptionId: subscription.id,
                    planType: subscription.plan_id, // This might need mapping back to 'startup' etc if needed
                    status: 'paid',
                    timestamp: serverTimestamp(),
                    method: paymentData?.method || 'subscription',
                    invoiceId: `CAL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}` // Simple fallback ID
                });
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
