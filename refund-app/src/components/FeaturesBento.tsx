"use client";

export default function FeaturesBento() {
    return (
        <section className="py-32 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Everything you need to <br />
                        <span className="text-blue-500">win back trust.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[800px]">

                    {/* Card 1: Hero Refund Proof (Large, Spans 2 cols, 2 rows) */}
                    <div className="md:col-span-2 md:row-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 md:p-12 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 mb-8">
                            <h3 className="text-3xl font-bold text-white mb-4">Instant Refund Proof</h3>
                            <p className="text-gray-400 text-lg max-w-md">
                                Don't wait for the UTR. Give customers <span className="text-white">instant proof</span> with Gateway IDs, timestamps, and clear timelines immediately.
                            </p>
                        </div>

                        {/* Visual: Proof Card Mockup */}
                        <div className="mt-auto relative w-full h-64 md:h-80 bg-[#111] rounded-t-2xl border-t border-l border-r border-white/10 p-6 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 origin-bottom">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Refund Initiated</div>
                                        <div className="text-xs text-gray-500">Just now</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Amount</div>
                                    <div className="text-white font-mono">₹2,499.00</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-[#1A1A1A] rounded-lg p-4 border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Gateway Ref ID</div>
                                    <div className="text-white font-mono text-sm">rf_3k92...92j1</div>
                                </div>
                                <div className="bg-[#1A1A1A] rounded-lg p-4 border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. Settlement</div>
                                    <div className="text-white font-mono text-sm">Dec 12 - Dec 14</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Automated Updates (Medium) */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="relative z-10 mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Zero Support Tickets</h3>
                            <p className="text-gray-400 text-sm">
                                Automated email updates at every step.
                            </p>
                        </div>

                        {/* Visual: Email Notification */}
                        <div className="mt-auto bg-[#111] rounded-xl border border-white/10 p-4 transform group-hover:translate-y-[-5px] transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold">R</div>
                                <div className="flex-1 min-w-0">
                                    <div className="h-2 w-24 bg-white/20 rounded mb-1"></div>
                                    <div className="h-1.5 w-16 bg-white/10 rounded"></div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded mb-2"></div>
                            <div className="h-2 w-2/3 bg-white/10 rounded"></div>
                        </div>
                    </div>

                    {/* Card 3: Failure Recovery (Medium) */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="relative z-10 mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Failure Recovery</h3>
                            <p className="text-gray-400 text-sm">
                                Automatically collect correct bank details if a refund fails.
                            </p>
                        </div>

                        {/* Visual: Failure -> Success */}
                        <div className="mt-auto relative h-24">
                            <div className="absolute inset-0 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-400 text-sm font-medium group-hover:opacity-0 transition-opacity duration-300">
                                ⚠ Refund Failed
                            </div>
                            <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-green-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                ✓ Secure Link Sent
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
