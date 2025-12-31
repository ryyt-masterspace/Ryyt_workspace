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

        // FIX: Subject Line
        let subject = `${brandName} Refund Update: Order #${orderId}`;

        // FIX: Dynamic Logo Logic
        const logoHtml = details?.brandLogo
            ? `<div style="margin-bottom: 24px;"><img src="${details.brandLogo}" alt="${brandName}" style="max-height: 48px; border-radius: 4px;" /></div>`
            : `<div style="margin-bottom: 24px; font-family: sans-serif; font-size: 24px; font-weight: bold; color: #333;">${brandName}</div>`;

        // --- TEMPLATE LOGIC ---
        let contentHtml = "";

        // --- STANDARD TRACKING BUTTON ---
        const trackingUrl = details?.link || '#';
        const trackingButton = `
            <div style="margin-top: 32px; text-align: center;">
                <a href="${trackingUrl}" style="background-color: #000000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                    Track Refund Status
                </a>
            </div>
        `;

        // Scenario: COD Order Created (Needs Details)
        if (type === 'GATHERING_DATA' || (type === 'CREATED' && paymentMethod === 'COD')) {
            subject = `${brandName}: Action Required for Order #${orderId}`;
            contentHtml = `
                    <h2 style="margin-top: 0; color: #333;">Refund Request Initiated</h2>
                    <p>Hi, <strong>${brandName}</strong> is processing a refund of <strong>₹${details?.amount || ''}</strong> for your order #${orderId}.</p>
                    <p>Since this was a Cash on Delivery order, we need your UPI details to transfer the money securely.</p>
                    
                    <p style="margin: 25px 0;">
                        <a href="${details?.link}" style="background-color: #0052FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Provide UPI Details
                        </a>
                    </p>
                    
                    <p style="font-size: 14px; color: #666;">Or copy this link: <br/>${details?.link}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999;">Sent by the ${brandName} Support Team.</p>
            `;
        }

        // Scenario: Details Submitted / Prepaid Created
        else if (type === 'REFUND_INITIATED' || type === 'CREATED') {
            contentHtml = `
                    <h2 style="margin-top: 0; color: #333;">Refund Initiated</h2>
                    <p>We have received your details for order #${orderId}. Your refund of <strong>₹${details?.amount || ''}</strong> is now in our queue.</p>
                    <p>We will notify you once <strong>${brandName}</strong> and the bank process it.</p>
                    ${trackingButton}
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">${brandName} Support Team</p>
            `;
        }

        // Scenario: Processing at Bank
        else if (type === 'PROCESSING_AT_BANK') {
            contentHtml = `
                    <h2 style="color: #0052FF; margin-top: 0;">Good News!</h2>
                    <p><strong>${brandName}</strong> has sent your refund request for order #${orderId} to the bank.</p>
                    <p>It usually takes 2-3 business days to reflect in your account depending on your bank's processing speed.</p>
                    ${trackingButton}
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">${brandName} Support Team</p>
            `;
        }

        // Scenario: Success (Settled)
        else if (type === 'SETTLED') {
            subject = `${brandName}: Refund Successful (Order #${orderId})`;
            contentHtml = `
                    <h2 style="color: #059669; margin-top: 0;">Refund Credited</h2>
                    <p>Your refund of <strong>₹${details?.amount || ''}</strong> for order #${orderId} has been successfully processed.</p>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 25px 0;">
                        <p style="margin: 0; color: #166534; font-size: 14px;">Reference Number (UTR)</p>
                        <p style="margin: 5px 0 0 0; font-size: 20px; font-family: monospace; font-weight: bold; color: #15803d; letter-spacing: 1px;">${details?.proofValue || 'N/A'}</p>
                    </div>

                    <p>Please check your bank statement. It should appear under the name <strong>${brandName}</strong> or its payment partner.</p>
                    ${trackingButton}
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">${brandName} Support Team</p>
            `;
        }

        // Scenario: Failed
        else if (type === 'FAILED') {
            subject = `Action Required: Refund Failed (Order #${orderId})`;
            contentHtml = `
                    <h2 style="color: #dc2626; margin-top: 0;">Refund Attempt Failed</h2>
                    <p>We encountered an issue while processing your refund for order #${orderId}.</p>
                    <p><strong>Reason:</strong> ${details?.reason || 'Incorrect UPI details or Bank Rejection'}</p>
                    
                    <p style="margin: 25px 0;">
                        <a href="${details?.link}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Update Payment Details
                        </a>
                    </p>
                    
                    <p>Please ensure your UPI ID is active and can receive payments. If you've updated your details, we will try again within 24 hours.</p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">${brandName} Support Team</p>
            `;
        } else {
            contentHtml = `
                <p>There is an update on your refund status for order #${orderId}.</p>
                ${trackingButton}
            `;
        }

        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 580px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
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
    } catch (error: unknown) {
        console.error("Email API Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Unknown error" }, { status: 500 });
    }
}
