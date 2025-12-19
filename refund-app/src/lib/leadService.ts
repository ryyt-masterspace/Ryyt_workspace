import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Lead Generation Service
 * Captures interested visitor emails from the chatbot.
 */
export async function saveLead(email: string) {
    try {
        const leadsRef = collection(db, "leads");
        await addDoc(leadsRef, {
            email: email.toLowerCase().trim(),
            source: "chatbot_sales_assistant",
            createdAt: serverTimestamp(),
            status: "NEW"
        });
        console.log(`[LeadService] Successfully captured lead: ${email}`);
        return { success: true };
    } catch (error) {
        console.error("[LeadService] Error saving lead:", error);
        throw error;
    }
}
