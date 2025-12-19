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

        // 3. Define Email Content (Smart Templates & Branding)
        const brandName = details?.brandName || "Ryyt";
        const orderId = details?.orderId || "N/A";
        const type = (triggerType || '').toString().toUpperCase();

        let subject = `${brandName} Refund Update: Order #${orderId}`;
        const logoHtml = details?.brandLogo
            ? `<div style="margin-bottom: 20px;"><img src="${details.brandLogo}" alt="${brandName}" style="max-height: 48px; border-radius: 4px;" /></div>`
            : `<div style="margin-bottom: 20px; width: 40px; height: 40px; background: #0052FF; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif;">${brandName.charAt(0).toUpperCase()}</div>`;

        // --- TEMPLATE LOGIC ---
        let contentHtml = "";

        // Scenario: COD Order Created (Needs Details)
        if (type === 'GATHERING_DATA' || (type === 'CREATED' && paymentMethod === 'COD')) {
            subject = `Action Required: Refund Details for Order #${orderId}`;
            contentHtml = `
                    <h2>Refund Request Initiated</h2>
                    <p>Hi, <strong>${brandName}</strong> is processing a refund of <strong>₹${details?.amount || ''}</strong> for your order #${orderId}.</p>
                    <p>Since this was a Cash on Delivery order, we need your UPI details to transfer the money securely.</p>
                    
                    <p style="margin: 25px 0;">
                        <a href="${details?.link}" style="background-color: #0052FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                            Provide UPI Details
                        </a>
                    </p>
                    
                    <p style="font-size: 14px; color: #666;">Or copy this link: <br/>${details?.link}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Sent by the ${brandName} Support Team via Ryyt.</p>
            `;
        }

        // Scenario: Details Submitted / Prepaid Created
        else if (type === 'REFUND_INITIATED' || type === 'CREATED') {
            contentHtml = `
                    <h2>Refund Initiated</h2>
                    <p>We have received your details for order #${orderId}. Your refund of <strong>₹${details?.amount || ''}</strong> is now in our queue.</p>
                    <p>We will notify you once <strong>${brandName}</strong> and the bank process it.</p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">${brandName} Support Team</p>
            `;
        }

        // Scenario: Processing at Bank
        else if (type === 'PROCESSING_AT_BANK') {
            contentHtml = `
                    <h2 style="color: #0052FF;">Good News!</h2>
                    <p><strong>${brandName}</strong> has sent your refund request for order #${orderId} to the bank.</p>
                    <p>It usually takes 2-3 business days to reflect in your account depending on your bank's processing speed.</p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">${brandName} Support Team</p>
            `;
        }

        // Scenario: Success (Settled)
        else if (type === 'SETTLED') {
            subject = `Refund Successful: Order #${orderId}`;
            contentHtml = `
                    <h2 style="color: #059669;">Refund Credited</h2>
                    <p>Your refund of <strong>₹${details?.amount || ''}</strong> for order #${orderId} has been successfully processed.</p>
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 15px 0;">
                        <p style="margin: 0;"><strong>Reference Number (UTR):</strong> <span style="font-size: 16px; font-family: monospace;">${details?.proofValue || 'N/A'}</span></p>
                    </div>
                    <p>Please check your bank statement. It should appear under the name <strong>${brandName}</strong> or its payment partner.</p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">${brandName} Support Team</p>
            `;
        }

        // Scenario: Failed
        else if (type === 'FAILED') {
            subject = `Update Required: Refund Failed for Order #${orderId}`;
            contentHtml = `
                    <h2 style="color: #dc2626;">Refund Attempt Failed</h2>
                    <p>We encountered an issue while processing your refund for order #${orderId}.</p>
                    <p><strong>Reason:</strong> ${details?.reason || 'Incorrect UPI details or Bank Rejection'}</p>
                    
                    <p style="margin: 25px 0;">
                        <a href="${details?.link}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Update Payment Details
                        </a>
                    </p>
                    
                    <p>Please ensure your UPI ID is active and can receive payments. If you've updated your details, we will try again within 24 hours.</p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">${brandName} Support Team</p>
            `;
        } else {
            contentHtml = `<p>There is an update on your refund status for order #${orderId}.</p>`;
        }

        const html = `
            <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                ${logoHtml}
                ${contentHtml}
            </div>
        `;

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
