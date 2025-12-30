export interface Refund {
    id: string;
    orderId?: string;
    customerName?: string;
    customerEmail?: string;
    targetUpi?: string;
    amount: number;
    paymentMethod?: string;
    status?: string;
    slaDueDate?: string | number | Date;
    merchantId?: string;
    createdAt?: { seconds: number; nanoseconds: number } | Date | null;
    proofValue?: string;
    failureReason?: string;
    proofs?: {
        utr?: string;
    };
    timeline?: Array<{
        label?: string;
        sub?: string;
        date: string;
        icon?: string;
        status?: string;
        title?: string;
    }>;
}
