import { PUBLIC_KNOWLEDGE, MERCHANT_SUPPORT, SALES_NUDGES, LEAD_CAPTURE_SUCCESS } from "@/config/chatbotData";
import { saveLead } from "@/lib/leadService";

/**
 * Smart Librarian Engine
 * Zero-Cost, Keyword-Based Logic
 */
const GREETINGS = ["hi", "hello", "hey", "good morning", "good evening", "namaste"];
const CLOSING = "\n\nDoes that help, or is there anything else I can explain?";

export async function getBotResponse(message: string, isLoggedIn: boolean): Promise<string> {
    const cleanMsg = message.toLowerCase().trim();

    // 1. Handle Greetings
    if (GREETINGS.some(g => cleanMsg === g)) {
        return `Hi there! I'm the Ryyt assistant. How can I help you today?`;
    }

    // 2. Email Detection (Lead Capture)
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g;
    const emailMatch = cleanMsg.match(emailRegex);

    if (emailMatch && !isLoggedIn) {
        try {
            await saveLead(emailMatch[0]);
            return LEAD_CAPTURE_SUCCESS;
        } catch (err) {
            console.error("Failed to save lead", err);
            // Fallback to normal processing if save fails
        }
    }

    // 3. Determine which pool to search
    const pool = isLoggedIn ? [...MERCHANT_SUPPORT, ...PUBLIC_KNOWLEDGE] : PUBLIC_KNOWLEDGE;

    // 4. Find ALL hits (Multi-hit logic)
    const matches: string[] = [];
    let containsSalesKeyword = false;

    for (const entry of pool) {
        if (entry.keywords.some(keyword => cleanMsg.includes(keyword))) {
            matches.push(entry.answer);
            if (entry.keywords.some(k => ["pricing", "demo", "quote"].includes(k))) {
                containsSalesKeyword = true;
            }
        }
    }

    if (matches.length > 0) {
        let finalResponse = matches.join("\n\n");

        // Add a random Sales Nudge for certain keywords
        if (containsSalesKeyword && !isLoggedIn) {
            const randomNudge = SALES_NUDGES[Math.floor(Math.random() * SALES_NUDGES.length)];
            finalResponse += `\n\n**Quick Tip:** ${randomNudge}`;
        }

        return finalResponse + CLOSING;
    }

    // 5. Logic Check: Logged-out user asking about dashboard features
    if (!isLoggedIn) {
        const dashboardKeywords = ["manual", "bulk", "csv", "status", "dashboard", "metrics", "find", "search"];
        if (dashboardKeywords.some(kw => cleanMsg.includes(kw))) {
            return "That sounds like a Merchant feature. Please log in to your dashboard to manage refunds and view analytics!" + CLOSING;
        }
    }

    // 6. Fallback
    const fallbackText = isLoggedIn
        ? "I'm not quite sure how to help with that yet. You can ask me about manual refunds, bulk CSV updates, or what different statuses mean!"
        : "I'm sorry, I don't have a specific answer for that yet. You can ask me about how Ryyt works, our pricing, or security compliance!";

    return fallbackText + CLOSING;
}
