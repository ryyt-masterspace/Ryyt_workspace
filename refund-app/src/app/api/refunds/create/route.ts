import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { PLANS, PlanType } from '@/config/plans';

export async function POST(req: Request) {
    try {
        const refundData = await req.json();
        const { merchantId } = refundData;

        if (!merchantId) {
            return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });
        }

        // 1. Fetch Merchant Data
        const merchantRef = doc(db, 'merchants', merchantId);
        const merchantSnap = await getDoc(merchantRef);

        if (!merchantSnap.exists()) {
            return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
        }

        const merchantData = merchantSnap.data();
        const planType = (merchantData.planType || 'startup') as PlanType;
        const plan = PLANS[planType];

        // 2. Fetch Current Usage
        const metricsRef = doc(db, 'merchants', merchantId, 'metadata', 'metrics');
        const metricsSnap = await getDoc(metricsRef);
        const currentUsage = metricsSnap.exists() ? (metricsSnap.data().totalRefundsCount || 0) : 0;

        // 3. Enforce Hard Limit
        const planLimit = plan.limit;
        if (currentUsage >= planLimit) {
            return NextResponse.json({
                error: "Plan Limit Reached. Please Upgrade to process more refunds.",
                usage: currentUsage,
                limit: planLimit
            }, { status: 403 });
        }

        // 4. Create Refund Record
        // Standardize the record structure (mimicking what was in CreateRefundModal/BulkImportModal)
        const docRef = await addDoc(collection(db, "refunds"), {
            ...refundData,
            createdAt: Timestamp.now()
        });

        return NextResponse.json({
            success: true,
            id: docRef.id
        });

    } catch (error: any) {
        console.error("REFUND_CREATE_API_ERROR:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
