import LegalWrapper from '@/components/marketing/LegalWrapper';

export default function PrivacyPage() {
    return (
        <LegalWrapper
            title="Privacy Policy"
            lastUpdated="December 20, 2025"
        >
            <div className="space-y-4">
                <p>
                    At <strong>Calcure Technologies Private Limited</strong> (&quot;Ryyt&quot;), we take data security seriously. We understand that we are processing sensitive financial information, and we are committed to maintaining the highest standards of privacy in compliance with the Information Technology Act, 2000, and the Digital Personal Data Protection (DPDP) principles.
                </p>
            </div>

            <Section title="1. Who We Are">
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Data Fiduciary:</strong> In the context of the Merchant&apos;s account data (your business details), Ryyt acts as the Data Fiduciary.</li>
                    <li><strong>Data Processor:</strong> In the context of the End-Customer&apos;s data (refund details), Ryyt acts as a Data Processor on behalf of the Merchant (who is the Fiduciary).</li>
                </ul>
            </Section>

            <Section title="2. Information We Collect">
                <p className="mb-2 text-zinc-300 font-medium">We collect specific data points necessary to execute the &quot;Financial Logistics&quot; of refunds:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Merchant Information:</strong> Business Name, GSTIN, Bank Account details (for configuration), and Authorized User contact details.</li>
                    <li><strong>Transaction Information:</strong> Order IDs, Refund Amounts, Return Reasons, and SKU details (to facilitate risk analysis).</li>
                    <li><strong>Beneficiary Information (For COD Refunds):</strong> To bridge the &quot;Digital Return Path,&quot; we collect the End-Customer&apos;s Name, Email, Phone Number, Bank Account Number, IFSC Code, or UPI ID.</li>
                </ul>
            </Section>

            <Section title="3. Data Security & Storage">
                <p className="mb-2">We employ an enterprise-grade security architecture:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Tenant Isolation:</strong> We strictly segregate data. Merchant A&apos;s data is logically isolated from Merchant B&apos;s using robust Firestore Security Rules and backend logic.</li>
                    <li><strong>Encryption:</strong> All sensitive financial data (PII) is encrypted at rest using AES-256 standards and in transit using TLS 1.2+.</li>
                </ul>
            </Section>

            <Section title="4. Grievance Redressal">
                <p className="mb-4">As per the IT Rules, 2011, you have the right to review, correct, or request the deletion of your data (subject to regulatory retention requirements).</p>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <p className="text-white font-bold mb-2">Grievance Officer</p>
                    <p className="text-zinc-300">Shuvam Sarkar</p>
                    <p className="text-sm text-zinc-500">Email: shuvam@ryyt.in</p>
                </div>
            </Section>
        </LegalWrapper>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-4">{title}</h2>
            <div className="text-zinc-400">
                {children}
            </div>
        </section>
    );
}

