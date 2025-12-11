import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        // 1. Security Check (Basic Bearer Token presence)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing Token' }, { status: 401 });
        }

        // 2. Parse Request Body
        const body = await request.json();
        const { triggerType, paymentMethod, customerEmail, merchantEmail, details } = body;

        console.log("Email Trigger:", { triggerType, paymentMethod, email: customerEmail });

        if (!customerEmail) {
            return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
        }

        // 3. Define Email Content (Smart Templates)
        let subject = "Update regarding your Refund";
        let html = "<p>There is an update on your refund status.</p>";
        const type = (triggerType || '').toString().toUpperCase();

        // --- TEMPLATE LOGIC ---

        // Scenario: COD Order Created (Needs Details)
        if (type === 'GATHERING_DATA' || (type === 'CREATED' && paymentMethod === 'COD')) {
            subject = "Action Required: Please provide Refund Details";
            html = `
                <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
                    <h2>Refund Request Initiated</h2>
                    <p>We are processing a refund of <strong>₹${details?.amount || ''}</strong>.</p>
                    <p>Since this was a Cash on Delivery order, we need your UPI details to transfer the money.</p>
                    
                    <p style="margin: 25px 0;">
                        <a href="${details?.link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                            Provide UPI Details
                        </a>
                    </p>
                    
                    <p style="font-size: 14px; color: #666;">Or copy this link: <br/>${details?.link}</p>
                </div>
            `;
        }

        // Scenario: Details Submitted / Prepaid Created
        else if (type === 'REFUND_INITIATED' || type === 'CREATED') {
            subject = "Refund Initiated";
            html = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Refund Initiated</h2>
                    <p>We have received your details. Your refund of <strong>₹${details?.amount || ''}</strong> is now in queue.</p>
                    <p>We will notify you once the bank processes it.</p>
                </div>
            `;
        }

        // Scenario: Processing
        else if (type === 'PROCESSING') {
            subject = "Refund Processing";
            html = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Processing at Bank</h2>
                    <p>Your refund has been sent to the bank. It usually takes 24-48 hours to reflect in your account.</p>
                </div>
            `;
        }

        // Scenario: Success (Settled)
        else if (type === 'SETTLED') {
            subject = "Refund Successful";
            html = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #059669;">Refund Credited</h2>
                    <p>Your refund has been successfully processed.</p>
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 15px 0;">
                        <strong>UTR / Reference No:</strong> ${details?.proofValue || 'N/A'}
                    </div>
                </div>
            `;
        }

        // Scenario: Failed
        else if (type === 'FAILED') {
            subject = "Update: Refund Failed";
            const isCOD = paymentMethod === 'COD';

            html = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #dc2626;">Refund Failed</h2>
                    <p>We could not process your refund.</p>
                    <p><strong>Reason:</strong> ${details?.reason || 'Unspecified Error'}</p>
                    
                    ${isCOD ? `
                        <p style="margin-top: 20px;">Please update your details to try again:</p>
                        <p>
                            <a href="${details?.link}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Update UPI Details
                            </a>
                        </p>
                    ` : `
                        <p>Please contact support for further assistance.</p>
                    `}
                </div>
            `;
        }

        // 4. Send Email via Resend
        const data = await resend.emails.send({
            from: 'Ryyt Refunds <refunds@ryyt.in>', // Using Verified Domain
            to: [customerEmail],
            replyTo: merchantEmail || undefined,
            subject: subject,
            html: html,
        });

        return NextResponse.json(data);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Email API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
