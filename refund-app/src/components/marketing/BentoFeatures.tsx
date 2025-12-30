import { ShieldCheck, MessageSquare, Tag, History } from 'lucide-react';

export default function BentoFeatures() {
    return (
        <section id="features" className="py-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Built for <span className="text-blue-500">Enterprise Scale.</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        Replace manual chaos with a system designed for high-volume D2C brands.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Card 1: Data / Manual Chase */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/20 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col">
                            <div className="mb-6">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 border border-blue-500/20">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">End the Manual UPI Chase</h3>
                            </div>

                            <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4">
                                <div className="w-full lg:w-1/2 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                    <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> The Risk
                                    </p>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Wasting hours collecting payment details over WhatsApp. Human errors lead to failed or incorrect payouts.
                                    </p>
                                </div>
                                <div className="w-full lg:w-1/2 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-[0_0_20px_-5px_rgba(0,82,255,0.1)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 blur-[40px] rounded-full"></div>
                                    <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> The Solution
                                    </p>
                                    <p className="text-zinc-200 text-sm leading-relaxed font-medium">
                                        Automated, secure links handle the collection for you. We verify the customer, you just click &apos;Approve&apos;.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Support / Tickets */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/20 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col">
                            <div className="mb-6">
                                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4 border border-amber-500/20">
                                    <MessageSquare className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Kill the &apos;Where is my refund?&apos; Tickets</h3>
                            </div>

                            <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4">
                                <div className="w-full lg:w-1/2 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                    <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> The Risk
                                    </p>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Customer anxiety peaks after a return. Your support team is flooded with status inquiries daily.
                                    </p>
                                </div>
                                <div className="w-full lg:w-1/2 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-[0_0_20px_-5px_rgba(0,82,255,0.1)]">
                                    <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> The Solution
                                    </p>
                                    <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                                        Real-time, branded tracking links for every customer. Total transparency from initiation to settlement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Trust */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/20 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col">
                            <div className="mb-6">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20">
                                    <Tag className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Build Trust with Every Transaction</h3>
                            </div>

                            <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4">
                                <div className="w-full lg:w-1/2 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                    <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> The Risk
                                    </p>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Generic emails that look like spam. Inconsistent communication makes customers doubt your brand&apos;s legitimacy.
                                    </p>
                                </div>
                                <div className="w-full lg:w-1/2 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-[0_0_20px_-5px_rgba(0,82,255,0.1)]">
                                    <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> The Solution
                                    </p>
                                    <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                                        100% white-labeled emails and professional PDF invoices. High-end branding that builds customer loyalty.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: SLA / Scale */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/20 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col">
                            <div className="mb-6">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 border border-purple-500/20">
                                    <History className="w-5 h-5 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Accounting on Auto-Pilot</h3>
                            </div>

                            <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4">
                                <div className="w-full lg:w-1/2 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                    <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> The Risk
                                    </p>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        RBI compliance stress and missing deadlines. Manual spreadsheets that lag as your D2C brand grows.
                                    </p>
                                </div>
                                <div className="w-full lg:w-1/2 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-[0_0_20px_-5px_rgba(0,82,255,0.1)]">
                                    <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> The Solution
                                    </p>
                                    <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                                        O(1) high-performance architecture with automated SLA timers. Scale to 10k+ refunds without breaking a sweat.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
