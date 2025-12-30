import { ShieldCheck, Zap, Tag } from 'lucide-react';

export default function FeaturesBento() {
    return (
        <section id="features" className="py-32 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Built for <span className="text-blue-500">Enterprise Scale.</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        Replace manual chaos with a system designed for high-volume D2C brands.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Security (Large) */}
                    <div className="md:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 md:p-10 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="mb-8">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-3">Stop Refund Fraud with Identity Guard</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* The Risk */}
                                <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl relative overflow-hidden group/risk">
                                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/risk:opacity-100 transition-opacity"></div>
                                    <p className="text-red-400 text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> The Risk
                                    </p>
                                    <p className="text-zinc-400 leading-relaxed text-sm">
                                        Manual UPI collection is a security nightmare. Chasing bank details over WhatsApp leads to data leaks and fraud.
                                    </p>
                                </div>

                                {/* The Guard */}
                                <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl shadow-[0_0_30px_-10px_rgba(0,82,255,0.15)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 blur-[40px] rounded-full"></div>
                                    <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> The Guard
                                    </p>
                                    <p className="text-zinc-200 leading-relaxed text-sm font-medium">
                                        Automated customer email verification before any UPI data is collected. Your customers&apos; data is locked in a private vault.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Performance (Vertical) */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 border border-amber-500/20">
                                    <Zap className="w-6 h-6 text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Enterprise Speed at Any Scale</h3>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                    <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-2">The Bottleneck</p>
                                    <p className="text-zinc-500 text-xs leading-relaxed">
                                        Legacy tools that slow down as you grow. Waiting for dashboards to load costs your team 10+ hours a week.
                                    </p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-[0_0_20px_-5px_rgba(0,82,255,0.1)]">
                                    <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-2">The Engine</p>
                                    <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                                        Built on a high-performance O(1) architecture. Your dashboard loads in milliseconds, whether you process 10 or 10,000 refunds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Trust (Standard, spans bottom if needed, but 3 cols suggests wrapping. Let's make it span full width or use a different grid. 
                       Wait, original was 2 rows, cols-3. 
                       Layout: 
                       [ Card 1 (2 cols) ] [ Card 2 (1 col) ]
                       [ Card 3 (3 cols) ?? No, usually bento is uneven. ]
                       
                       Let's make Card 3 span 3 cols? Or maybe Card 2 and 3 share the bottom row.
                       The previous layout had Card 1 span 2 cols, 2 rows. And Card 2, Card 3 were stacked?
                       "md:col-span-2 md:row-span-2" for Card 1.
                       Card 2 and 3 were implicit 1 col.
                       
                       Let's look at the requirement: "Card 1 (Security)", "Card 2 (Performance)", "Card 3 (Trust)".
                       If Card 1 is big, Card 2 and 3 fit in the remaining column?
                       The previous grid was `grid-cols-1 md:grid-cols-3 grid-rows-2`.
                       Card 1: `col-span-2 row-span-2`.
                       Card 2: `bg-[#0A0A0A]...` (implicit col-span-1)
                       Card 3: `bg-[#0A0A0A]...` (implicit col-span-1)
                       
                       So Card 2 is top-right, Card 3 is bottom-right.
                       
                       I will preserve this layout.
                       Card 1: Security.
                       Card 2: Performance.
                       Card 3: Trust.
                       
                       Wait, "Overhaul Card 3 (The Trust Card)".
                       I need to make sure Card 3 fits in the grid.
                       I'll just put Card 3 below Card 2.
                    */}

                    {/* Card 3: Trust (Vertical) */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors md:col-start-3 md:row-start-2">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                                    <Tag className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">100% White-Labeled</h3>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                    <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-2">The Friction</p>
                                    <p className="text-zinc-500 text-xs leading-relaxed">
                                        Generic, spam-like emails that confuse customers and trigger support tickets asking &apos;Where is my money?&apos;
                                    </p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-[0_0_20px_-5px_rgba(0,82,255,0.1)]">
                                    <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-2">The Proof</p>
                                    <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                                        Fully branded tracking pages and professional PDF invoices issued by Calcure Technologies.
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
