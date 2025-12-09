'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function WhyUs() {
    return (
        <section id="why-us" className="py-20 relative z-10 overflow-hidden border-y border-white/5">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 tracking-tight">The Old Way <span className="text-zinc-600 px-4">vs</span> The Ryyt Way</h2>

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
                    <div className="absolute inset-0 bg-[#0052FF]/5 pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 relative">

                        {/* LEFT: THE OLD WAY (Dimmed, Red) */}
                        <div className="p-12 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950/50">
                            <h3 className="text-xl font-bold text-zinc-500 mb-8 uppercase tracking-widest text-left">Your Current Gateway</h3>
                            <div className="space-y-8 text-left">
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-2">
                                        <XCircle className="text-red-900 shrink-0 mt-1" />
                                        <h4 className="text-lg font-bold text-zinc-400 group-hover:text-red-400 transition-colors">They trap your cash.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-600 text-sm leading-relaxed">
                                        You have to keep dead cash in a separate wallet "just in case" of refunds. That's money you can't use for ads or inventory.
                                    </p>
                                </div>
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-2">
                                        <XCircle className="text-red-900 shrink-0 mt-1" />
                                        <h4 className="text-lg font-bold text-zinc-400 group-hover:text-red-400 transition-colors">Hidden RBI Fines.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-600 text-sm leading-relaxed">
                                        They won't warn you when you breach the timeline. They just let the ₹100/day penalty pile up on your bill.
                                    </p>
                                </div>
                                <div className="group">
                                    <div className="flex items-start gap-4 mb-2">
                                        <XCircle className="text-red-900 shrink-0 mt-1" />
                                        <h4 className="text-lg font-bold text-zinc-400 group-hover:text-red-400 transition-colors">Manual Chaos.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-600 text-sm leading-relaxed">
                                        Excel sheets, phone calls, and "Where is my money?" emails clogging your support inbox every day.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: THE RYYT WAY (Bright, Blue) */}
                        <div className="p-12 bg-gradient-to-br from-[#0052FF]/10 to-transparent relative overflow-hidden">
                            {/* Blue Glow Effect */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0052FF]/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

                            <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-widest text-left flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-[#0052FF]" /> Ryyt
                            </h3>

                            <div className="space-y-8 text-left relative z-10">
                                <div>
                                    <div className="flex items-start gap-4 mb-2">
                                        <CheckCircle2 className="text-[#0052FF] shrink-0 mt-1 drop-shadow-[0_0_10px_rgba(0,82,255,0.5)]" />
                                        <h4 className="text-lg font-bold text-white">Financial Sovereignty.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-400 text-sm leading-relaxed">
                                        Pay refunds directly from your bank account. Keep your cash flow free for growth until the last second.
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-start gap-4 mb-2">
                                        <CheckCircle2 className="text-[#0052FF] shrink-0 mt-1 drop-shadow-[0_0_10px_rgba(0,82,255,0.5)]" />
                                        <h4 className="text-lg font-bold text-white">Compliance Shield.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-400 text-sm leading-relaxed">
                                        We track every SLA breach in real-time so you never lose money to fines again.
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-start gap-4 mb-2">
                                        <CheckCircle2 className="text-[#0052FF] shrink-0 mt-1 drop-shadow-[0_0_10px_rgba(0,82,255,0.5)]" />
                                        <h4 className="text-lg font-bold text-white">Auto-Pilot Ops.</h4>
                                    </div>
                                    <p className="pl-10 text-zinc-400 text-sm leading-relaxed">
                                        We collect bank details via WhatsApp, process the payout, and notify the customer. Zero manual work.
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
