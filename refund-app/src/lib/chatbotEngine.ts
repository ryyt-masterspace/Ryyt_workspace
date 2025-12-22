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

    const cleanMsg = input.toLowerCase().trim();

    // 1. Lead Capture Priority (Email + Phone)
    // CRITICAL: Check this BEFORE any other logic.
    if (!isLoggedIn) {
        const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
        const phoneRegex = /(?:\+?91)?[6-9]\d{9}/g;

        const emailMatches = cleanMsg.match(emailRegex) || [];
        const phoneMatches = cleanMsg.match(phoneRegex) || [];
        const contacts = Array.from(new Set([...emailMatches, ...phoneMatches]));

        if (contacts.length > 0) {
            console.log("Lead Detected in Input:", contacts); // Debugging for Founder

            let leadCaptured = false;
            for (const contact of contacts) {
                try {
                    console.log("Attempting to save lead:", contact);
                    await saveLead(contact, interestContext);
                    leadCaptured = true;
                } catch (err: unknown) {
                    console.error("Failed to save lead", contact, err);
                }
            }

            if (leadCaptured) {
                return {
                    text: LEAD_CAPTURE_SUCCESS,
                    actions: [],
                    captureLead: true
                };
            }
        }
    }

    // 2. Direct Scenario Navigation (Button Click)
    if (scenarioId && SCENARIO_MAP[scenarioId]) {
        const scenario = SCENARIO_MAP[scenarioId];
        return {
            text: scenario.message,
            actions: scenario.options
        };
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

    // 5. Fallback
    const fallbackRoot = SCENARIO_MAP["root"];
    return {
        text: "I'm not exactly sure what you mean, but I can help you with these topics:",
        actions: fallbackRoot.options
    };
}
