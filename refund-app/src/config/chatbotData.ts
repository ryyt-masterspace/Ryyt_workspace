/**
 * Local Knowledge Base for Ryyt Chatbot
 * Zero API calls, Zero cost.
 */

export const SALES_NUDGES = [
    "Did you know Ryyt reduces refund support queries by 40%? It's like adding an extra team member for free!",
    "Merchants using Ryyt often see their customer trust scores double in the first 30 days. Ready to join them?",
    "Managing refunds manually takes 12 minutes per order. Ryyt does it in 15 seconds. Just think of what you could do with that extra time!"
];

export const LEAD_CAPTURE_SUCCESS = "Thanks! I've shared your email with our founder. We'll reach out shortly with something special for you. Anything else I can help with?";

export const PUBLIC_KNOWLEDGE = [
    {
        keywords: ["ryyt", "what is", "about"],
        answer: "Ryyt is your 'Financial Control Tower' for e-commerce. We simplify the chaotic world of COD refunds by giving you the tools to pay customers instantly via QR codes and secure UPI links. The best part? We never touch your money—everything happens directly between your bank and your customer!"
    },
    {
        keywords: ["pricing", "cost", "free", "quote"],
        answer: "We want to help every brand grow! That's why we have a generous 'Free Plan' for startups (up to 50 refunds every month). As you scale, our 'Growth Plan' offers unlimited refunds for just ₹2,499/mo.\n\nBy the way, if you drop your email here, I can send you a custom quote for your business size!"
    },
    {
        keywords: ["demo", "see it", "try it", "how it looks"],
        answer: "You can see Ryyt in action right on our homepage via the interactive dashboard demo! It shows exactly how the 'Scan to Pay' flow works.\n\nIf you drop your email here, I can also schedule a personalized 10-minute walkthrough for your team."
    },
    {
        keywords: ["secure", "security", "touch my money", "rbi"],
        answer: "Security is our top priority. Ryyt is designed to be a non-custodial platform, meaning we don't hold your funds. We merely generate the payment instructions (like dynamic QR codes) so you can settle refunds through your own trusted banking apps."
    }
];

export const MERCHANT_SUPPORT = [
    {
        keywords: ["manual", "create", "new refund"],
        answer: "Creating a manual refund is super easy! Just head to your dashboard and look for the '+ New Refund' button. Fill in the Order ID, the amount, and your customer's email. We'll take care of the rest, including sending out the collection link for COD orders automatically."
    },
    {
        keywords: ["bulk", "csv", "import", "upload"],
        answer: "If you have a lot of refunds to process, our 'Bulk Import' tool is your best friend! You can download our CSV template, add all your order details, and upload it in one go. We'll instantly generate tracking IDs and collection links for every single row in your file."
    },
    {
        keywords: ["status", "settled", "pending", "failed", "gathering"],
        answer: "Think of statuses as a roadmap for your refunds:\n• 'Settled' means the money has successfully reached your customer.\n• 'Gathering Data' means we're still waiting for the customer to provide their UPI details.\n• 'Refund Initiated' is your cue to pay—the UPI is ready and waiting for you to scan.\n• 'Failed' usually means there was a bank rejection or an incorrect UPI ID."
    },
    {
        keywords: ["find", "search", "track"],
        answer: "To find a specific refund, just use the search bar at the top of your dashboard! You can type in the Order ID or the Customer Email, and we'll filter everything instantly. It's the fastest way to get a quick update on a specific customer."
    },
    {
        keywords: ["scoreboard", "metrics", "analytics"],
        answer: "Your Scoreboard is a real-time snapshot of your business health. It tracks your 'Total Settled' amount, your 'Active Liability' (money you still need to pay out), and any 'Stuck Amount' that needs your attention. It updates instantly every time you take an action!"
    }
];
