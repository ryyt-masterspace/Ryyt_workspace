import { SCENARIO_MAP, KEYWORD_MAP, SALES_NUDGES, LEAD_CAPTURE_SUCCESS, Scenario } from "@/config/chatbotData";
import { saveLead } from "@/lib/leadService";

/**
 * Smart Librarian Engine (Navigator Edition)
 * Scenario-Based State Machine
 */
const GREETINGS = ["hi", "hello", "hey", "good morning", "good evening", "namaste"];

// Response Interface
export interface BotResponse {
    text: string;
    actions: { label: string; nextId: string }[];
    captureLead?: boolean;
}

export async function getBotResponse(
    input: string,
    isLoggedIn: boolean,
    interestContext: string = "General",
    scenarioId?: string
): Promise<BotResponse> {

    // 1. Direct Scenario Navigation (Button Click)
    if (scenarioId && SCENARIO_MAP[scenarioId]) {
        const scenario = SCENARIO_MAP[scenarioId];
        return {
            text: scenario.message,
            actions: scenario.options
        };
    }

    const cleanMsg = input.toLowerCase().trim();

    // 2. Handle Lead Capture (Email + Phone)
    // Only capture if they ARE NOT logged in (Visitors)
    if (!isLoggedIn) {
        const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
        const phoneRegex = /(?:\+?91)?[6-9]\d{9}/g;

        const emailMatches = cleanMsg.match(emailRegex) || [];
        const phoneMatches = cleanMsg.match(phoneRegex) || [];
        const contacts = Array.from(new Set([...emailMatches, ...phoneMatches]));

        if (contacts.length > 0) {
            let leadCaptured = false;
            for (const contact of contacts) {
                try {
                    await saveLead(contact, interestContext);
                    leadCaptured = true;
                } catch (err) {
                    console.error("Failed to save lead", contact, err);
                }
            }

            if (leadCaptured) {
                return {
                    text: LEAD_CAPTURE_SUCCESS,
                    actions: [], // Actions are handled by the Guided Exit UI in ChatWindow
                    captureLead: true
                };
            }
        }
    }

    // 3. Handle Greetings
    if (GREETINGS.some(g => cleanMsg === g)) {
        const root = SCENARIO_MAP["root"];
        return {
            text: root.message,
            actions: root.options
        };
    }

    // 4. Keyword Matching -> Map to Scenario
    for (const mapping of KEYWORD_MAP) {
        if (mapping.keywords.some(kw => cleanMsg.includes(kw))) {
            const scenario = SCENARIO_MAP[mapping.scenarioId];
            return {
                text: scenario.message,
                actions: scenario.options
            };
        }
    }

    // 5. Merchant Support /LoggedIn Logic can remain as fallback text or map to a generic support scenario
    // For now, if logged in, we give a standard helpful response, but we really want to drive them to the scenarios.

    // 6. Fallback
    const fallbackRoot = SCENARIO_MAP["root"];
    return {
        text: "I'm not exactly sure what you mean, but I can help you with these topics:",
        actions: fallbackRoot.options
    };
}
