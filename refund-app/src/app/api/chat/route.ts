import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { messages, context } = body; // context: { userId, path }

        const lastMessage = messages[messages.length - 1].text;
        const lowerMsg = lastMessage.toLowerCase();
        const isSupportMode = !!context.userId;

        let reply = "";

        // --- MODE 1: SUPPORT AGENT (Logged In) ---
        if (isSupportMode) {

            // 1. EXTRACT ORDER ID (Aggressive Search)
            // Matches: "ORD-123", "123456", "id is 123", "#123"
            const orderIdMatch = lastMessage.match(/(?:order\s*id|id|#|ref)?\s*[:#\s]?\s*([a-zA-Z0-9-_]{4,20})/i);
            const potentialId = orderIdMatch ? orderIdMatch[1] : null;
            const isCommonWord = potentialId ? ['status', 'refund', 'check', 'hello', 'help', 'thanks', 'track', 'this', 'what'].includes(potentialId.toLowerCase()) : true;

            // 2. DETECT INTENT (What is the user trying to do?)
            const intentPatterns = {
                status: /status|track|check|where|progress/i,
                explainPage: /what is|explain|guide|help|do here|this page|this screen|dashboard/i,
                failure: /fail|error|declined|reject/i,
                export: /csv|excel|download|export|report/i,
                greeting: /hi|hello|hey|morning|evening/i
            };

            // --- EXECUTION LOGIC ---

            // CASE A: User provided an Order ID (Implicitly asking for status)
            if (potentialId && !isCommonWord) {
                const orderId = potentialId;
                const refundsRef = collection(db, 'refunds');
                const q = query(refundsRef, where('orderId', '==', orderId), where('merchantId', '==', context.userId));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const refund = snapshot.docs[0].data();
                    const status = refund.status.replace('_', ' ');

                    reply = `I've pulled up Order **#${orderId}**.\n\n` +
                        `• **Status:** ${status}\n` +
                        `• **Amount:** ₹${refund.amount}`;

                    if (refund.status === 'FAILED') {
                        reply += `\n• **Reason:** ${refund.details?.reason || 'Bank Error'}\n` +
                            `👉 *You should click 'Retry' in the Failures tab.*`;
                    } else if (refund.status === 'SETTLED') {
                        reply += `\n• **UTR:** ${refund.details?.proofValue || 'Generated'}`;
                    } else if (refund.status === 'PROCESSING') {
                        reply += `\nIt's with the bank. Settlement usually happens within 24 hours.`;
                    }
                } else {
                    reply = `I checked the database for **#${orderId}** but found no records.\n` +
                        `Are you sure that's the correct ID? You can copy it directly from the dashboard row.`;
                }
            }

            // CASE B: Contextual Help (User asks about "This Page")
            else if (intentPatterns.explainPage.test(lowerMsg)) {
                const path = context.path || '';
                const pageName = path.split('/').pop();

                if (path.includes('failures')) {
                    reply = "You are on the **Failures Console**. This is where we flagged refunds that the bank rejected (usually bad UPI IDs). You can retry them here with one click.";
                } else if (path.includes('reports')) {
                    reply = "This is the **Reports Hub**. You can select a date range and download a CSV file of all your refunds for accounting/reconciliation.";
                } else if (path.includes('settled')) {
                    reply = "This is your **Success Archive**. Every refund here has been completed and has a UTR number attached for proof.";
                } else if (path.includes('settings')) {
                    reply = "This is **Settings**. You can manage your API Keys here. If you're looking to integrate with your backend, this is the place.";
                } else {
                    // Generic Dashboard
                    reply = "You're on the main **Dashboard**. I can help you navigate. Try asking 'Where are my failed refunds?' or 'How do I download a report?'.";
                }
            }

            // CASE C: Specific Topics
            else if (intentPatterns.failure.test(lowerMsg)) {
                reply = "If you're facing failures, check the **Failures Tab** regarding the specific error. Usually, it's just an incorrect UPI ID from the customer.";
            } else if (intentPatterns.export.test(lowerMsg)) {
                reply = "To export data, go to the **Reports** tab on the left. You can download your entire history as a CSV file there.";
            }

            // CASE D: Greeting
            else if (intentPatterns.greeting.test(lowerMsg)) {
                reply = `Hello! I'm ready to help. I have access to your dashboard context. You can ask me to **check an Order ID** or **explain this page**.`;
            }

            // CASE E: Fallback (Conversational, not robotic)
            else {
                reply = "I'm listening, but I didn't catch an Order ID or a specific topic. \n" +
                    "Could you paste the **Order Number** you're looking for? Or ask me 'What is this page?'.";
            }
        }

        // --- MODE 2: SALES AGENT (Public) ---
        else {
            if (lowerMsg.includes("pricing") || lowerMsg.includes("cost")) {
                reply = "We have a simple pay-as-you-go model. 1% per transaction. No monthly fees. Want to see the enterprise tiers?";
            } else if (lowerMsg.includes("demo") || lowerMsg.includes("how")) {
                reply = "Ryyt automates the entire refund lifecycle. You connect your bank, upload a CSV, and we handle the rest. Should I show you a video?";
            } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
                reply = "Hi there! Welcome to Ryyt. I can help you understand our features or pricing.";
            } else {
                reply = "I'm the Ryyt Concierge. Ask me about Pricing, Features, or how we treat your customers!";
            }
        }

        return NextResponse.json({
            role: "agent",
            text: reply,
            id: Date.now().toString()
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
