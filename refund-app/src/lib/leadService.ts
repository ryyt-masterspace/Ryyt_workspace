import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Lead Generation Service
 * Captures interested visitor emails from the chatbot.
 */
export async function saveLead(contact: string, interest: string = "General") {
    try {
        const leadsRef = collection(db, "leads");
        await addDoc(leadsRef, {
            contact: contact.toLowerCase().trim(),
            source: "chatbot_sales_assistant",
            type: contact.includes("@") ? "email" : "phone",
            interest: interest,
            createdAt: serverTimestamp(),
            status: "NEW"
        });
        console.log(`[LeadService] Successfully captured lead: ${contact}`);
        return { success: true };
    } catch (error) {
        console.error("[LeadService] Error saving lead:", error);
        throw error;
    }
}
