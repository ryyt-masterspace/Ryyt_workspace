import LegalWrapper from '@/components/marketing/LegalWrapper';

export default function CancellationRefundPolicyPage() {
    return (
        <LegalWrapper
            title="Cancellation & Refund Policy"
            lastUpdated="December 20, 2025"
        >
            <div className="space-y-4">
                <p>
                    This Cancellation & Refund Policy outlines the terms for cancelling your subscription with <strong>Ryyt</strong> and the refund facilitating nature of our platform.
                </p>
            </div>

            <Section title="1. Subscription Cancellation">
                <p>You may cancel your Ryyt subscription at any time through your Dashboard or by emailing <span className="text-indigo-400">support@ryyt.in</span>.</p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li><strong>No-Contract:</strong> Ryyt operates on a month-to-month or annual basis with no long-term lock-in.</li>
                    <li><strong>Access:</strong> Upon cancellation, your access will continue until the end of your current billing cycle.</li>
                </ul>
            </Section>

            <Section title="2. Refund Policy (SaaS)">
                <p>As a SaaS platform, Ryyt typically does not offer refunds for "change of mind" or "unused days" once a billing cycle has started. However, we evaluate technical failures or billing errors on a case-by-case basis.</p>
            </Section>

            <Section title="3. Merchant-to-Customer Refunds">
                <p className="border-l-2 border-indigo-500 pl-4 bg-white/[0.02] py-4 rounded-r-lg italic">
                    <strong>IMPORTANT:</strong> Ryyt is a technology platform that facilitates refunds from Merchants to End-Customers. Ryyt does not hold, manage, or transfer the actual funds. All Merchant-to-Customer refunds are governed by the Merchant's own return policy. Ryyt is not liable for delayed or failed funds transfers caused by banking network issues.
                </p>
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
