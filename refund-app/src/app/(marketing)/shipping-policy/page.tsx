import LegalWrapper from '@/components/marketing/LegalWrapper';

export default function ShippingPolicyPage() {
    return (
        <LegalWrapper
            title="Shipping & Delivery Policy"
            lastUpdated="December 20, 2025"
        >
            <div className="space-y-4">
                <p>
                    Since <strong>Ryyt</strong> is a Software-as-a-Service (SaaS) platform, there are no physical goods to be shipped. This policy outlines how we deliver our digital services.
                </p>
            </div>

            <Section title="1. Digital Delivery">
                <p>Access to the Ryyt platform is provided instantly upon successful registration and account verification.</p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li><strong>Dashboard Access:</strong> Your credentials allow immediate login to the merchant dashboard.</li>
                    <li><strong>Integration Links:</strong> Tracking links and "Magic QR" features are generated in real-time.</li>
                </ul>
            </Section>

            <Section title="2. Service Continuity">
                <p>We aim for 99.9% uptime. In the event of scheduled maintenance or unexpected downtime, notifications will be sent via the dashboard or registered email.</p>
            </Section>

            <Section title="3. Physical Shipments">
                <p>Ryyt does not ship any physical hardware or marketing materials unless explicitly mentioned in a specific enterprise contract.</p>
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
