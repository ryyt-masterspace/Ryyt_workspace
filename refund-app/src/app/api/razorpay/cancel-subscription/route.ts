import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
    try {
        const { subscriptionId, userId } = await req.json();

        if (!subscriptionId || !userId) {
            return NextResponse.json({ error: 'Missing subscriptionId or userId' }, { status: 400 });
        }

        const merchantRef = doc(db, 'merchants', userId);
        const merchantSnap = await getDoc(merchantRef);

        if (!merchantSnap.exists()) {
            return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
        }

        // 1. Call Razorpay Cancel API
        // cancel_at_cycle_end is optional, default is immediate cancellation usually or pending
        // We will cancel immediately.
        try {
            await razorpay.subscriptions.cancel(subscriptionId, false); // false = cancel immediately
        } catch (razorError: any) {
            console.error('[Razorpay Cancel Error]', razorError);
            // Verify if it's already cancelled to be idempotent
            if (razorError.error?.code !== 'BAD_REQUEST_ERROR') {
                throw razorError;
            }
        }

        // 2. Update Firestore
        await updateDoc(merchantRef, {
            subscriptionStatus: 'cancelled',
            // We usually keep the planType for record until they expire, 
            // but status 'cancelled' effectively stops access in standard logic.
            // keeping lastPaymentDate allows 'run-out' logic if needed.
        });

        return NextResponse.json({ success: true, status: 'cancelled' });

    } catch (error: any) {
        console.error('[Cancel Subscription Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
