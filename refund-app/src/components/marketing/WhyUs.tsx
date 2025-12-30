'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function WhyUs() {
    return (
        <section id="why-us" className="py-24 relative z-10 overflow-hidden border-y border-white/5 bg-black">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Trust isn&apos;t built on sales.<br />It&apos;s built on <span className="text-blue-500">Refunds.</span></h2>

                {/* GLASS MONOLITH CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative"
                >
                    {/* Inner Glow */}
                    <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                    <div className="grid grid-cols-1 md:grid-cols-2 relative">

                        {/* LEFT: THE CHAOS (The Refund Chaos) */}
                        <div className="p-10 md:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950/20 opacity-80 group">
                            <h3 className="text-sm font-black text-zinc-600 mb-10 uppercase tracking-[0.2em] text-left">THE REFUND CHAOS</h3>
                            <div className="space-y-10 text-left">
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-3">
                                        <XCircle className="text-zinc-700 shrink-0 mt-1 w-6 h-6 group-hover:text-red-900 transition-colors" />
                                        <h4 className="text-lg font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">The Manual Grind.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-600 text-sm leading-relaxed">
                                        Chasing UPI IDs over WhatsApp and manually updating Excel sheets wastes your team&apos;s most valuable hours.
                                    </p>
                                </div>
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-3">
                                        <XCircle className="text-zinc-700 shrink-0 mt-1 w-6 h-6 group-hover:text-red-900 transition-colors" />
                                        <h4 className="text-lg font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">The Support Flood.</h4>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">&quot;I didn&apos;t get my refund&quot;</h3>
                                    <p className="pl-10 text-zinc-400 text-sm leading-relaxed">Customers are anxious about their money. Manual tracking means you&apos;re always defensive, not proactive.</p>
                                </div>
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-3">
                                        <XCircle className="text-zinc-700 shrink-0 mt-1 w-6 h-6 group-hover:text-red-900 transition-colors" />
                                        <h4 className="text-lg font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">The Brand Disconnect.</h4>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">&quot;Where is my money?&quot;</h3>
                                    <p className="pl-10 text-zinc-400 text-sm leading-relaxed">Every COD refund is a support ticket waiting to happen. You ask for UPI, they forget, you get blamed. It&apos;s a &quot;Lose-Lose&quot; cycle.</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: THE ADVANTAGE (The Ryyt Advantage) */}
                        <div className="p-10 md:p-12 bg-gradient-to-br from-[#0052FF]/15 to-black relative overflow-hidden">
                            {/* Blue Glow Effect */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0052FF]/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

                            <h3 className="text-sm font-black text-blue-500 mb-10 uppercase tracking-[0.2em] text-left flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse" /> THE RYYT ADVANTAGE
                            </h3>

                            <div className="space-y-10 text-left relative z-10">
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-3">
                                        <CheckCircle2 className="text-blue-500 shrink-0 mt-1 w-6 h-6 drop-shadow-[0_0_8px_rgba(0,82,255,0.6)]" />
                                        <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Zero-Touch Automation.</h4>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">You&apos;re not the &quot;Bad Guy&quot;</h3>
                                    <p className="pl-10 text-zinc-400 text-sm leading-relaxed leading-relaxed font-medium">Poor refund experience isn&apos;t your fault, it&apos;s your system&apos;s fault. We fix the system so you keep the customer&apos;s trust.</p>
                                </div>
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-3">
                                        <CheckCircle2 className="text-blue-500 shrink-0 mt-1 w-6 h-6 drop-shadow-[0_0_8px_rgba(0,82,255,0.6)]" />
                                        <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Proactive Transparency.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-300 text-sm leading-relaxed font-medium">
                                        Live, branded tracking links and real-time updates keep customers calm and your support inbox empty.
                                    </p>
                                </div>
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-3">
                                        <CheckCircle2 className="text-blue-500 shrink-0 mt-1 w-6 h-6 drop-shadow-[0_0_8px_rgba(0,82,255,0.6)]" />
                                        <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Enterprise Trust.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-300 text-sm leading-relaxed font-medium">
                                        100% white-labeled emails and professional PDF invoices. Look like a billion-dollar brand to every single customer.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Divider Line (Mobile: Horizontal, Desktop: Vertical) */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

                </motion.div>
            </div>
        </section>
    );
}
