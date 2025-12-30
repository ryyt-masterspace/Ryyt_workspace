import LegalWrapper from '@/components/marketing/LegalWrapper';

export default function TermsPage() {
    return (
        <LegalWrapper
            title="Terms & Conditions"
            lastUpdated="December 20, 2025"
        >
            <div className="space-y-4">
                <p className="text-sm border-l-2 border-indigo-500 pl-4 bg-white/[0.02] py-4 pr-4 rounded-r-lg italic">
                    PLEASE READ CAREFULLY: These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between <strong>Calcure Technologies Private Limited</strong> (&quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Ryyt&quot;), a company incorporated under the Companies Act, 2013, and You (&quot;Merchant&quot;, &quot;User&quot;, or &quot;Client&quot;).
                </p>
                <p>
                    By creating an account, accessing, or using the Ryyt platform (the &quot;Service&quot;), you agree to be bound by these Terms.
                </p>
            </div>

            <Section title="1. Nature of Services">
                <p>Ryyt is a <strong>Technology Service Provider</strong>, not a Financial Institution.</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>No Banking License:</strong> We are not a bank, Payment System Operator (PSO), or Payment Aggregator (PA) as defined by the RBI. We do not hold, pool, or settle funds.</li>
                    <li><strong>Infrastructure Layer:</strong> We provide the software layer that instructs your connected banks or payment gateways to move funds.</li>
                </ul>
            </Section>

            <Section title="2. Merchant Responsibilities">
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Liquidity:</strong> You acknowledge that refund triggers function only if You have sufficient funds in your source account.</li>
                    <li><strong>Data Accuracy:</strong> You are responsible for verifying the identity of the beneficiary. Ryyt is not liable for incorrect account transfers due to erroneous data.</li>
                </ul>
            </Section>

            <Section title="3. Regulatory Compliance">
                <p>You are solely responsible for ensuring your refund policies comply with the Consumer Protection (E-Commerce) Rules, 2020, and RBI&apos;s &quot;Harmonisation of Turn Around Time&quot; (TAT) directions.</p>
            </Section>

            <Section title="4. Governing Law">
                <p>These Terms shall be governed by the laws of India. The courts of Kolkata, West Bengal shall have exclusive jurisdiction over any disputes.</p>
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

