"use client";

import { motion } from "framer-motion";
import { Check, Shield, Zap, Rocket } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/config/plans";
import { useModal } from "@/context/ModalContext";

const REAL_FEATURES = [
    "Bulk Processing: CSV Import & Bulk Status Updates.",
    "Identity Guard: Secure customer identity verification.",
    "SLA Tracking: Real-time monitoring of refund timelines.",
    "Failure Analysis: Automated root-cause reporting for failed payouts.",
    "Branded Communications: White-labeled emails & tracking pages.",
    "Finance-Grade Invoicing: Professional PDF Invoices by Calcure Tech."
];

export default function Pricing() {
    const { openLeadModal } = useModal();

    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-[#0A0A0A]">
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
                        No hidden setup fees. Transparent, outcome-based pricing for high-volume D2C merchants.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">

                    {/* Startup Plan */}
                    <PricingCard
                        plan={PLANS.startup}
                        features={REAL_FEATURES}
                        icon={<Zap className="text-blue-400" size={24} />}
                        delay={0.1}
                    />

                    {/* Growth Plan (Highlighted) */}
                    <PricingCard
                        plan={PLANS.growth}
                        features={REAL_FEATURES}
                        icon={<Rocket className="text-blue-500" size={24} />}
                        highlighted={true}
                        delay={0.2}
                    />

                    {/* Scale Plan */}
                    <PricingCard
                        plan={PLANS.scale}
                        features={REAL_FEATURES}
                        icon={<Shield className="text-purple-400" size={24} />}
                        delay={0.3}
                    />

                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-zinc-600">
                        Need more than 1,000 refunds per month? <button onClick={openLeadModal} className="text-blue-500 font-bold hover:underline">Contact Enterprise Sales</button>
                    </p>
                </div>
            </div>
        </section>
    );
}

function PricingCard({ plan, features, icon, highlighted = false, delay = 0 }: {
    plan: {
        name: string;
        price: number;
        originalPrice: number;
        setupFee: number;
        limit: number;
        overageRate: null;
    },
    features: string[],
    icon: React.ReactNode,
    highlighted?: boolean,
    delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className={`flex flex-col h-full rounded-3xl p-8 border transition-all duration-300 ${highlighted
                ? "bg-gradient-to-b from-blue-600/10 to-[#0A0A0A] border-blue-600/50 shadow-[0_0_40px_-15px_rgba(0,82,255,0.3)] relative scale-105 z-20"
                : "bg-white/[0.02] border-white/10 hover:border-white/20"
                }`}
        >
            {highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.1em] shadow-lg shadow-blue-900/40">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex flex-col mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm text-zinc-500 line-through">₹{plan.originalPrice.toLocaleString()}</span>
                        <span className="text-4xl font-bold text-white">₹{plan.price.toLocaleString()}</span>
                        <span className="text-zinc-500 text-sm">/mo</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">+ ₹{plan.setupFee.toLocaleString()} Setup Fee</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <p className="text-white font-bold text-sm">
                        {plan.limit.toLocaleString()} Refunds Included
                    </p>
                    <p className="text-zinc-500 text-[11px] mt-1">
                        Hard Monthly Limit
                    </p>
                </div>
            </div>

            <div className="flex-1">
                <ul className="space-y-4 mb-10">
                    {features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-[13px] text-zinc-400 leading-snug">
                            <Check size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>
            </div>

            <Link
                href="/signup"
                className={`w-full py-4 rounded-xl font-bold text-center transition-all duration-300 ${highlighted
                    ? "bg-[#0052FF] text-white hover:bg-[#0040DD] shadow-xl shadow-blue-900/40"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    }`}>
                Get Started
            </Link>
        </motion.div>
    );
}
