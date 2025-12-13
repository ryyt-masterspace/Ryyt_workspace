'use client';
import { motion } from 'framer-motion';

export default function TermsPage() {
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
                        Terms and Conditions
                    </h1>
                    <p className="text-zinc-500">
                        Last Updated: <span className="text-zinc-300">December 10, 2025</span>
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
                        <p className="text-sm border-l-2 border-[#0052FF] pl-4 bg-white/[0.02] py-4 pr-4 rounded-r-lg">
                            PLEASE READ CAREFULLY: These Terms and Conditions ("Terms") constitute a legally binding agreement between <strong>Calcure Technologies Private Limited</strong> ("Company", "We", "Us", or "Ryyt"), a company incorporated under the Companies Act, 2013, and You ("Merchant", "User", or "Client").
                        </p>
                        <p>
                            By creating an account, accessing, or using the Ryyt platform (the "Service"), you agree to be bound by these Terms.
                        </p>
                    </div>

                    <Section title="1. Definitions">
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>"Service":</strong> The Ryyt SaaS platform, including the dashboard, API, "Magic QR" features, "Gathering Engine," and analytics tools.</li>
                            <li><strong>"Merchant":</strong> The business entity using the Service to manage refunds for its customers.</li>
                            <li><strong>"End-Customer":</strong> The individual who purchased goods/services from the Merchant and is the recipient of the refund.</li>
                            <li><strong>"Payment Data":</strong> Information related to UPI IDs, bank accounts, and transaction references (UTRs).</li>
                        </ul>
                    </Section>

                    <Section title="2. Nature of Services & Disclaimer">
                        <p>Ryyt is a <strong>Technology Service Provider</strong>, not a Financial Institution.</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>No Banking License:</strong> We are not a bank, Payment System Operator (PSO), or Payment Aggregator (PA) as defined by the Reserve Bank of India (RBI). We do not hold, pool, settle, or touch your funds at any point.</li>
                            <li><strong>The Role of Ryyt:</strong> We provide the software layer that instructs your connected banks or payment gateways to move funds. The actual movement of money occurs directly between your bank/gateway and the End-Customer.</li>
                        </ul>
                    </Section>

                    <Section title="3. Merchant Responsibilities & Fund Management">
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Liquidity Management:</strong> You acknowledge that the "Magic QR" and API refund triggers function only if You have sufficient funds in your source account (Bank Account or Gateway Wallet). Ryyt is not responsible for refund failures caused by "Insufficient Funds" or "Zero Balance" scenarios.</li>
                            <li><strong>Data Accuracy:</strong> While our "Gathering Engine" employs validation logic to check UPI formats (e.g., handle@bank), You are ultimately responsible for verifying the identity of the beneficiary. Ryyt is not liable for funds transferred to an incorrect account due to erroneous data provided by You or Your End-Customer.</li>
                        </ul>
                    </Section>

                    <Section title="4. The 'Magic QR' & Scan-to-Pay Feature">
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Functionality:</strong> The "Magic QR" feature generates a dynamic UPI QR code containing the beneficiary's details and the refund amount.</li>
                            <li><strong>Transaction Liability:</strong> When You scan this QR code with a third-party UPI app (e.g., GPay, PhonePe, Paytm), the transaction is processed by the National Payments Corporation of India (NPCI) network. Ryyt has no control over the transaction once the QR is scanned. Any "Pending" or "Failed" status at the banking layer must be resolved with your bank.</li>
                        </ul>
                    </Section>

                    <Section title="5. Regulatory Compliance (RBI)">
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Merchant's Duty:</strong> You are solely responsible for ensuring your refund policies comply with applicable laws, including the Consumer Protection (E-Commerce) Rules, 2020, and RBI’s "Harmonisation of Turn Around Time" (TAT) directions.</li>
                            <li><strong>Tool Usage:</strong> The "SLA Dashboard" and "Liability Calculator" are reporting tools designed to assist you in monitoring compliance. They do not constitute legal advice. We are not liable for any regulatory fines, penalties (including the ₹100/day delay penalty), or legal actions taken against you.</li>
                        </ul>
                    </Section>

                    <Section title="6. Intellectual Property Rights">
                        <p>All rights, title, and interest in and to the Ryyt platform, including its code, algorithms ("Risk Engine," "Gathering Engine"), design, and "Ryyt" trademark, belong exclusively to Calcure Technologies Private Limited. You are granted a limited, non-exclusive, non-transferable license to use the Service for your internal business operations.</p>
                    </Section>

                    <Section title="7. Limitation of Liability">
                        <p>To the fullest extent permitted by law, Calcure Technologies Private Limited shall not be liable for:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Indirect, incidental, special, or consequential damages (including loss of revenue or profit).</li>
                            <li>Damages resulting from banking network downtime, gateway failures, or third-party service interruptions.</li>
                            <li>Fraudulent claims or "Wardrobing" activities committed by End-Customers against the Merchant.</li>
                        </ul>
                    </Section>

                    <Section title="8. Termination">
                        <p>We reserve the right to suspend or terminate your access to the Service immediately, without prior notice, if you breach these Terms or if we detect suspicious activity (e.g., money laundering patterns, fraudulent use of the platform).</p>
                    </Section>

                    <Section title="9. Governing Law">
                        <p>These Terms shall be governed by and construed in accordance with the laws of India. The courts of Kolkata, West Bengal shall have exclusive jurisdiction over any disputes.</p>
                    </Section>

                    <div className="pt-12 border-t border-white/10 mt-12">
                        <h3 className="text-white font-bold mb-2">Contact Us</h3>
                        <p>If you have any questions about these Terms, please contact us at:</p>
                        <a href="mailto:shuvam@ryyt.in" className="text-[#0052FF] hover:underline block mt-2">shuvam@ryyt.in</a>
                    </div>

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
