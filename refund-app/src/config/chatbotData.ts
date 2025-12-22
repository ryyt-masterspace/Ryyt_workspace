/**
 * Local Knowledge Base for Ryyt Chatbot
 * Zero API calls, Zero cost.
 * Persona: "Ryyt" (First-Person, Founder-Centric)
 */

export const SALES_NUDGES = [
    "Shuvam built me to save you time. Did you know I can cut your refund processing time by 90%?",
    "I can secure your brand's reputation by making refunds instant and transparent. Shuvam calls it 'Trust Engineering'.",
    "Manual refunds are a pain. I turn them into a 15-second task. Want to see how?"
];

export const LEAD_CAPTURE_SUCCESS = "Got it! I'm sending your contact details to Shuvam right now. 🚀 He’ll reach out personally within 24-48 hours. I've locked this chat so I don't get in the way of his message! What's your next move?";

// --- SCENARIO MAP ARCHITECTURE ---

export interface Scenario {
    id: string;
    message: string;
    options: { label: string; nextId: string }[];
}

export const SCENARIO_MAP: Record<string, Scenario> = {
    // 1. ROOT
    "root": {
        id: "root",
        message: "Hi! My name is Ryyt. 👋 Shuvam, my founder, built me to ensure your brand never has to deal with a messy refund process again. I handle your customer's UPI ID collection and branded tracking so you don't have to. What can I solve for you?",
        options: [
            { label: "How do I integrate you?", nextId: "integration_menu" },
            { label: "Are you secure?", nextId: "security_menu" },
            { label: "What will my customers see?", nextId: "experience_menu" },
            { label: "Show me the pricing.", nextId: "pricing_menu" },
            { label: "Talk to Shuvam", nextId: "story_menu" } // "The Ryyt Story" / Founder logic
        ]
    },

    // 2. INTEGRATION FLOW
    "integration_menu": {
        id: "integration_menu",
        message: "Shuvam designed me to be 'Plug-and-Play'. You don't need any developer help. How exactly do you want to use me?",
        options: [
            { label: "Bulk CSV Uploads", nextId: "integrate_csv" },
            { label: "No-Code Setup", nextId: "integrate_nocode" },
            { label: "Launch Timeline", nextId: "integrate_timeline" },
            { label: "Return to Main Menu", nextId: "root" }
        ]
    },
    "integrate_csv": {
        id: "integrate_csv",
        message: "It's simple. You download my template, paste your Order IDs and Amounts, and upload it back. I instantly generate unique tracking links for every customer. I can handle 500+ refunds in one go!",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "integrate_nocode": {
        id: "integrate_nocode",
        message: "Zero code required. I respect your existing tech stack. I live on my own secure cloud. You just use my dashboard to manage everything. No plugins to install, no servers to crash.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "integrate_timeline": {
        id: "integrate_timeline",
        message: "You can be live in 5 minutes. 1 minute to sign up, 2 minutes to verify your business, and 2 minutes to send your first refund link. I'm ready when you are.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },

    // 3. SECURITY FLOW
    "security_menu": {
        id: "security_menu",
        message: "Security is Shuvam's #1 priority. He built me with banking-grade protocols. What specific security concern do you have?",
        options: [
            { label: "Data Isolation", nextId: "sec_isolation" },
            { label: "Identity Guard", nextId: "sec_identity" },
            { label: "Bank-Grade Storage", nextId: "sec_storage" },
            { label: "Return to Main Menu", nextId: "root" }
        ]
    },
    "sec_isolation": {
        id: "sec_isolation",
        message: "Your data is yours alone. I store your customer records in a dedicated, isolated partition. No other merchant on Ryyt can ever access or even see your transaction data.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "sec_identity": {
        id: "sec_identity",
        message: "I verify every customer before I let them enter bank details. I double-check that the link belongs to *their* specific email or phone number. Scammers don't stand a chance with me.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "sec_storage": {
        id: "sec_storage",
        message: "I encrypt all sensitive data (like UPI IDs) using AES-256 standards before they even touch my database. Even Shuvam can't read the raw data—only the banking system can.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },

    // 4. EXPERIENCE FLOW
    "experience_menu": {
        id: "experience_menu",
        message: "I turn a boring refund into a premium brand touchpoint. I make your customers feel valued, not ignored. What part of the journey interests you?",
        options: [
            { label: "Branded Tracking", nextId: "exp_tracking" },
            { label: "Customer Recovery", nextId: "exp_recovery" },
            { label: "Email Logic", nextId: "exp_email" },
            { label: "Return to Main Menu", nextId: "root" }
        ]
    },
    "exp_tracking": {
        id: "exp_tracking",
        message: "Your customers get a beautiful, clean page with YOUR logo on it. It shows them exactly what's happening: 'Payment Initiated', 'Processing', or 'Settled'. No more mystery.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "exp_recovery": {
        id: "exp_recovery",
        message: "A fast refund wins a customer for life. By solving their issue instantly with me, you turn a negative experience into a reason to trust you again. 70% of customers return after a good refund experience.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "exp_email": {
        id: "exp_email",
        message: "I send polite, professional updates at every step. 'We need your UPI ID', 'Thanks, we got it', 'Money sent!'. I keep them in the loop so they never have to email support.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },

    // 5. PRICING FLOW
    "pricing_menu": {
        id: "pricing_menu",
        message: "Simple, honest pricing. Shuvam hates hidden fees, so he made sure I don't have any. What details do you need?",
        options: [
            { label: "Plan Limits", nextId: "price_limits" },
            { label: "Overage Math", nextId: "price_overage" },
            { label: "Enterprise Quotes", nextId: "price_enterprise" },
            { label: "Return to Main Menu", nextId: "root" }
        ]
    },
    "price_limits": {
        id: "price_limits",
        message: "Our Startup Plan is ₹999/mo and covers 50 refunds. That's usually enough for most growing brands. The Growth Plan is ₹2,499 for 200 refunds.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "price_overage": {
        id: "price_overage",
        message: "If you go over your limit, don't worry. I just charge a small fee per extra refund (₹8 to ₹12 depending on your plan). Your service never stops.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "price_enterprise": {
        id: "price_enterprise",
        message: "Processing 1000+ refunds? Shuvam can build a custom plan just for you. Drop your contact details, and I'll flag it as high-priority for him.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },

    // 6. STORY FLOW (Talk to Shuvam)
    "story_menu": {
        id: "story_menu",
        message: "Shuvam loves connecting with merchants! He built Ryyt because he saw how broken the old way was. What would you like to know?",
        options: [
            { label: "Why he built this", nextId: "story_why" },
            { label: "Future Vision", nextId: "story_vision" },
            { label: "Leave a Message", nextId: "story_contact" },
            { label: "Return to Main Menu", nextId: "root" }
        ]
    },
    "story_why": {
        id: "story_why",
        message: "He saw founders wasting hours collecting bank details on WhatsApp and email. It was messy, insecure, and slow. He built me to automate that entire headache away.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "story_vision": {
        id: "story_vision",
        message: "Shuvam wants Ryyt to be the 'Trust Layer' of Indian E-commerce. First refunds, next... who knows? He's always building something new to help you grow.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    },
    "story_contact": {
        id: "story_contact",
        message: "The best way to reach him is right here. Just type your email or phone number below, and I'll send your note directly to his personal inbox.",
        options: [{ label: "Return to Main Menu", nextId: "root" }]
    }
};

// Fallback for keyword matching (if used) can map to these IDs
export const KEYWORD_MAP: { keywords: string[], scenarioId: string }[] = [
    { keywords: ["integrate", "setup", "install"], scenarioId: "integration_menu" },
    { keywords: ["security", "safe", "secure"], scenarioId: "security_menu" },
    { keywords: ["customer", "experience", "look like"], scenarioId: "experience_menu" },
    { keywords: ["price", "cost", "pricing"], scenarioId: "pricing_menu" },
    { keywords: ["shuvam", "founder", "story"], scenarioId: "story_menu" },
    { keywords: ["csv", "bulk"], scenarioId: "integrate_csv" },
    { keywords: ["nocode", "no-code"], scenarioId: "integrate_nocode" }
];
