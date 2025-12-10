'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldAlert, Database } from 'lucide-react';

export default function AboutPage() {
    return (
        <section className="relative min-h-screen pt-40 pb-24 px-6 overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0052FF]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-4xl relative z-10">

                {/* 1. HERO HEADLINE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <span className="text-[#0052FF] text-sm font-bold tracking-widest uppercase mb-4 block">The Ryyt Story</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                        The Financial Logistics Layer for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Instant Economy.</span>
                    </h1>
                </motion.div>

                {/* 2. THE GENESIS */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-24 space-y-6"
                >
                    <h2 className="text-2xl text-white font-bold">The Genesis: The Midnight Anxiety</h2>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        The story of <strong className="text-white">Calcure Technologies</strong> began with a simple, frustrating observation: India’s e-commerce engine is built for speed, but its brakes are broken.
                    </p>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        We watched merchants—people running incredible D2C brands—spending their nights in a state of "Refund Anxiety." They had perfected their logistics to deliver a package in 10 minutes. They had optimized their gateways to accept payments in 3 seconds. Yet, the moment a customer asked for a refund, the entire machinery ground to a halt.
                    </p>
                    <div className="pl-6 border-l-2 border-[#0052FF]/50 my-8">
                        <p className="text-xl text-white italic">
                            "We realized that for the Indian merchant, returning money wasn't a transaction. It was a crisis."
                        </p>
                    </div>
                </motion.div>

                {/* 3. THE REALIZATION (The Gap Cards) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <h2 className="text-2xl text-white font-bold mb-8">The Realization: It’s Not Logistics, It’s Finance</h2>
                    <p className="text-lg text-zinc-400 mb-8">
                        The industry was trying to solve this with "better logistics" (tracking the box). We realized the problem was actually Financial Logistics (tracking the money). We saw a massive gap:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-md">
                            <Database className="text-[#0052FF] mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">The Data Void</h3>
                            <p className="text-sm text-zinc-400">
                                60% of India pays via COD, creating a "Digital Return Path Void" where the merchant holds cash but has no digital way to return it.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-md">
                            <ShieldAlert className="text-red-400 mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">The Compliance Blindspot</h3>
                            <p className="text-sm text-zinc-400">
                                With RBI’s 2025 mandates enforcing strict T+1 timelines, refunds stopped being just a "service" issue and became a "regulatory emergency".
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 4. THE SOLUTION */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-24 space-y-6"
                >
                    <h2 className="text-2xl text-white font-bold flex items-center gap-2">
                        The Solution: Building Ryyt <Zap className="text-yellow-400" size={24} fill="currentColor" />
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        Ryyt is the answer. We built the <strong>"Just-in-Time" Refund Operating System.</strong>
                    </p>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        We moved away from the "one-size-fits-all" banking approach. We built the <strong>Dynamic QR Engine</strong> to give merchants financial sovereignty—allowing them to fund refunds instantly from their existing bank account balance, bypassing the "Wallet Trap" entirely.
                    </p>
                </motion.div>

                {/* 5. VISION */}
                <div className="p-12 rounded-3xl bg-gradient-to-br from-[#0052FF]/20 to-transparent border border-[#0052FF]/30 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
                    <p className="text-xl text-zinc-200 max-w-2xl mx-auto leading-relaxed">
                        We are building the "Middleware of Trust". In an economy where trust is the currency, Ryyt ensures that the promise of a refund is as reliable as the promise of delivery.
                    </p>
                </div>

            </div>
        </section>
    );
}
