import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
    console.log("API Route Hit: Attempting to send email...");

    try {
        const body = await request.json();
        const { to, subject, type, data, triggerType, paymentMethod } = body;

        // 0. Security Guard
        // Allow public access ONLY for 'DETAILS_RECEIVED' (Customer Action)
        const effectiveType = triggerType || type; // Support both for backward compat
        const isPublicAction = effectiveType === 'DETAILS_RECEIVED';

        const authHeader = request.headers.get('Authorization');
        if (!isPublicAction && (!authHeader || !authHeader.startsWith('Bearer '))) {
            console.error("SECURITY ALERT: Unauthorized attempt to send email.");
            return NextResponse.json({ error: 'Unauthorized Request' }, { status: 401 });
        }

        // 1. Check for API Key presence safely
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL: RESEND_API_KEY is missing in process.env");
            return NextResponse.json(
                { error: "CONFIGURATION ERROR: Server needs a restart to load the API Key." },
                { status: 500 }
            );
        }

        const resend = new Resend(apiKey);

        // 2. Dynamic Template Logic
        let emailHtml = "";
        let emailSubject = subject || "Update on your Refund";

        switch (effectiveType) {
            case 'REFUND_INITIATED': // Replaces CREATED
            case 'CREATED':          // Legacy fallback
                emailSubject = `Refund Initiated: Order #${data.orderId}`;
                emailHtml = `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1>Refund Initiated</h1>
                        <p>Hi ${data.customerName},</p>
                        <p>We have received your details. Your refund of <strong>₹${data.amount}</strong> is now in queue.</p>
                        <p><a href="${data.trackingLink}" style="color: blue;">Track Status Here</a></p>
                    </div>`;
                break;

            case 'DETAILS_RECEIVED':
                emailSubject = `Payment Details Received: Order #${data.orderId}`;
                emailHtml = `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1>Details Received</h1>
                        <p>Hi ${data.customerName},</p>
                        <p>Thanks for submitting your payment details. We are now processing your refund of <strong>₹${data.amount}</strong>.</p>
                        <p><a href="${data.trackingLink}" style="color: blue;">Track Status Here</a></p>
                    </div>`;
                break;

            case 'PROCESSING':
            case 'PROCESSING_AT_BANK':
                emailSubject = `Processing: Refund for Order #${data.orderId}`;
                emailHtml = `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1>Processing at Bank</h1>
                        <p>Hi ${data.customerName},</p>
                        <p>Your refund of <strong>₹${data.amount}</strong> has been sent to the banking partner. It usually takes 24-48 hours to credit.</p>
                        <p><a href="${data.trackingLink}" style="color: blue;">Track Status Here</a></p>
                    </div>`;
                break;

            case 'SETTLED':
                emailSubject = `Refund Successful: Order #${data.orderId}`;
                emailHtml = `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1 style="color: green;">Refund Successful</h1>
                        <p>Hi ${data.customerName},</p>
                        <p>Your refund of <strong>₹${data.amount}</strong> has been successfully credited.</p>
                        <p><strong>Reference / UTR:</strong> ${data.proofValue || data.utr || 'N/A'}</p>
                        <p><a href="${data.trackingLink}" style="color: blue;">View Receipt</a></p>
                    </div>`;
                break;

            case 'FAILED':
                const isCOD = paymentMethod === 'COD';
                if (isCOD) {
                    // Critical Retry Flow
                    emailSubject = `Action Required: Refund Failed (Order #${data.orderId})`;
                    emailHtml = `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1 style="color: red;">Action Required</h1>
                        <p>Hi ${data.customerName},</p>
                        <p>We could not process your refund of <strong>₹${data.amount}</strong> because the provided UPI ID was invalid.</p>
                        <p><strong>Reason:</strong> ${data.reason || 'Invalid Details'}</p>
                        <p>Please update your details immediately to retry processing:</p>
                        <p><a href="${data.trackingLink.replace('/t/', '/pay/')}" style="color: white; background-color: blue; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Payment Details</a></p>
                    </div>`;
                } else {
                    // Standard Notification (Prepaid)
                    emailSubject = `Refund Failed: Order #${data.orderId}`;
                    emailHtml = `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1 style="color: red;">Refund Failed</h1>
                        <p>Hi ${data.customerName},</p>
                        <p>We could not process your refund of <strong>₹${data.amount}</strong> due to a banking issue.</p>
                        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #721c24;"><strong>Reason:</strong> ${data.reason || 'Bank Error'}</p>
                        </div>
                        <p>Our team has been notified. Please contact support if this persists.</p>
                    </div>`;
                }
                break;

            default:
                emailHtml = `<p>Update for Order #${data.orderId}</p>`;
        }

        console.log(`Sending email to: ${to}`);

        // 4. Send Email
        const emailPayload: any = {
            from: 'Ryyt Refunds <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: emailHtml,
        };

        if (body.merchantEmail) {
            emailPayload.reply_to = body.merchantEmail;
        }

        const dataRes = await resend.emails.send(emailPayload);

        if (dataRes.error) {
            console.error("Resend API Error:", dataRes.error);
            return NextResponse.json({ error: dataRes.error.message }, { status: 500 });
        }

        return NextResponse.json(dataRes);

    } catch (error: any) {
        console.error("API Route Validation/Execution Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
