"use client";

import { motion } from "framer-motion";
import { Check, Shield, Zap, Rocket } from "lucide-react";
import { PLANS } from "@/config/plans";

const features = {
    startup: [
        "Up to 100 Refunds / Month",
        "UPI & QR Collection",
        "Basic Analytics Dashboard",
        "7-Day Support (Email)",
        "Standard SLA Tracking"
    ],
    growth: [
        "Up to 300 Refunds / Month",
        "Priority Settlement Logic",
        "Advanced Failure Analysis",
        "Bulk CSV Imports",
        "API Placeholder Access"
    ],
    scale: [
        "Up to 1000 Refunds / Month",
        "Custom ERP Integrations",
        "Dedicated Account Manager",
        "Early Beta API Access",
        "Custom Brand Formatting"
    ]
};

export default function Pricing() {
    return (
        <section className="py-24 relative overflow-hidden bg-[#0A0A0A]">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-4"
                    >
                        Pricing that scales with your growth.
                    </motion.h2>
                    <p className="text-zinc-500 max-w-xl mx-auto">
                        No hidden setup fees. Transparent pricing for merchants who care about their customer's payout experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* Startup Plan */}
                    <PricingCard
                        plan={PLANS.startup}
                        features={features.startup}
                        icon={<Zap className="text-blue-400" size={24} />}
                        delay={0.1}
                    />

                    {/* Growth Plan (Highlighted) */}
                    <PricingCard
                        plan={PLANS.growth}
                        features={features.growth}
                        icon={<Rocket className="text-blue-500" size={24} />}
                        highlighted={true}
                        delay={0.2}
                    />

                    {/* Scale Plan */}
                    <PricingCard
                        plan={PLANS.scale}
                        features={features.scale}
                        icon={<Shield className="text-purple-400" size={24} />}
                        delay={0.3}
                    />

                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-zinc-600">
                        Need more than 1,000 refunds per month? <button className="text-blue-500 font-bold hover:underline">Contact Enterprise Sales</button>
                    </p>
                </div>
            </div>
        </section>
    );
}

function PricingCard({ plan, features, icon, highlighted = false, delay = 0 }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className={`flex flex-col h-full rounded-2xl p-8 border ${highlighted
                    ? "bg-gradient-to-b from-blue-600/10 to-transparent border-blue-600/50 shadow-[0_0_40px_-15px_rgba(0,82,255,0.3)] relative"
                    : "bg-white/[0.02] border-white/10"
                }`}
        >
            {highlighted && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">₹{plan.basePrice.toLocaleString()}</span>
                    <span className="text-zinc-500 text-sm">/mo</span>
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                    {plan.includedRefunds} included • ₹{plan.excessRate}/excess
                </p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                        <Check size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        {f}
                    </li>
                ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition-all ${highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}>
                Get Started
            </button>
        </motion.div>
    );
}
