'use client';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
    return (
        <section className="relative min-h-screen pt-40 pb-24 px-6 overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0052FF]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-3xl relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-zinc-500">
                        Effective Date: <span className="text-zinc-300">December 10, 2025</span>
                    </p>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-12 text-zinc-400 leading-relaxed"
                >
                    <div className="space-y-4">
                        <p>
                            At <strong>Calcure Technologies Private Limited</strong> ("Ryyt"), we take data security seriously. We understand that we are processing sensitive financial information, and we are committed to maintaining the highest standards of privacy in compliance with the Information Technology Act, 2000, and the Digital Personal Data Protection (DPDP) principles.
                        </p>
                    </div>

                    <Section title="1. Who We Are">
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Data Fiduciary:</strong> In the context of the Merchant's account data (your business details), Ryyt acts as the Data Fiduciary.</li>
                            <li><strong>Data Processor:</strong> In the context of the End-Customer's data (refund details), Ryyt acts as a Data Processor on behalf of the Merchant (who is the Fiduciary).</li>
                        </ul>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p className="mb-2">We collect specific data points necessary to execute the "Financial Logistics" of refunds:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Merchant Information:</strong> Business Name, GSTIN, Bank Account details (for configuration), and Authorized User contact details.</li>
                            <li><strong>Transaction Information:</strong> Order IDs, Refund Amounts, Return Reasons, and SKU details (to facilitate risk analysis).</li>
                            <li><strong>Beneficiary Information (For COD Refunds):</strong> To bridge the "Digital Return Path," we collect the End-Customer's Name, Email, Phone Number, Bank Account Number, IFSC Code, or UPI ID.</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Use This Information">
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Execution:</strong> To validate beneficiary details and instruct payment gateways to process refunds.</li>
                            <li><strong>Automation:</strong> To trigger the "Gathering Engine" emails/SMS that allow customers to input their own bank details.</li>
                            <li><strong>Compliance & Analytics:</strong> To track the age of refunds and populate the "SLA Dashboard," helping you visualize liability and avoid RBI penalties.</li>
                            <li><strong>Risk Monitoring:</strong> To analyze patterns (e.g., high-volume refunds from a single user) to assist in fraud detection.</li>
                        </ul>
                    </Section>

                    <Section title="4. Data Security & Tenant Isolation">
                        <p className="mb-2">We employ an enterprise-grade security architecture:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Tenant Isolation:</strong> We strictly segregate data. Merchant A’s data is logically isolated from Merchant B’s using robust Firestore Security Rules and backend logic.</li>
                            <li><strong>Encryption:</strong> All sensitive financial data (PII) is encrypted at rest using AES-256 standards and in transit using TLS 1.2+.</li>
                            <li><strong>Sanitization:</strong> Our "Smart Sanitizer" validates inputs to prevent injection attacks and ensures data integrity.</li>
                        </ul>
                    </Section>

                    <Section title="5. Data Sharing & Third Parties">
                        <p className="mb-2">We do not sell data. We share data only with essential infrastructure partners required to complete the refund:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Banking Partners & Gateways:</strong> (e.g., Razorpay, Cashfree, Banks) to execute the funds transfer.</li>
                            <li><strong>Communication Providers:</strong> (e.g., Email/SMS gateways) to send tracking links and status updates.</li>
                        </ul>
                    </Section>

                    <Section title="6. Data Retention">
                        <p>We retain transaction logs and audit trails (including UTRs and time-stamps) for a minimum period of <strong>5 years</strong> as required by RBI regulations for financial record-keeping and dispute resolution ("Evidence Locker").</p>
                    </Section>

                    <Section title="7. Your Rights & Grievance Redressal">
                        <p className="mb-4">As per the IT Rules, 2011, you have the right to review, correct, or request the deletion of your data (subject to regulatory retention requirements).</p>

                        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl">
                            <h4 className="text-white font-bold mb-4">Grievance Officer</h4>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-zinc-500">Name:</span> Shuvam Sarkar</p>
                                <p><span className="text-zinc-500">Designation:</span> Grievance Officer</p>
                                <p><span className="text-zinc-500">Company:</span> Calcure Technologies Private Limited</p>
                                <p><span className="text-zinc-500">Email:</span> <a href="mailto:shuvam@ryyt.in" className="text-[#0052FF] hover:underline">shuvam@ryyt.in</a></p>
                                <p><span className="text-zinc-500">Address:</span> Shantiniketan Apartment, 3 No Basunagar, Madhyamgram, Kolkata 700129</p>
                            </div>
                        </div>
                    </Section>

                </motion.div>
            </div>
        </section>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
            <div className="text-sm md:text-base">
                {children}
            </div>
        </section>
    );
}
