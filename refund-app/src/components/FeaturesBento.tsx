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

                    {/* Card 1: Hero Refund Proof (Large) */}
                    <div className="md:col-span-2 md:row-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 md:p-10 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 mb-6">
                            <h3 className="text-3xl font-bold text-white mb-3">Instant Refund Proof</h3>
                            <p className="text-gray-400 text-lg max-w-md">
                                Don't wait for the UTR. Give customers <span className="text-white">instant proof</span> with Gateway IDs, timestamps, and clear timelines immediately.
                            </p>
                        </div>

                        {/* Visual: Proof Card Mockup */}
                        <div className="relative w-full flex-1 bg-[#111] rounded-t-2xl border-t border-l border-r border-white/10 p-6 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 origin-bottom mt-4">
                            {/* Status Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
                                        <svg className="w-5 h-5 text-green-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium flex items-center gap-2">
                                            Refund Initiated
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        </div>
                                        <div className="text-xs text-gray-500">Just now</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Amount</div>
                                    <div className="text-white font-mono text-lg">₹2,499.00</div>
                                </div>
                            </div>

                            {/* Data Rows */}
                            <div className="space-y-3">
                                <div className="bg-[#1A1A1A] rounded-lg p-4 border border-white/5 flex justify-between items-center group/row hover:bg-[#222] transition-colors cursor-default">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Gateway Ref ID</div>
                                        <div className="text-white font-mono text-sm">rf_3k92...92j1</div>
                                    </div>
                                    <div className="text-xs text-blue-400 opacity-0 group-hover/row:opacity-100 transition-opacity">Copied</div>
                                </div>
                                <div className="bg-[#1A1A1A] rounded-lg p-4 border border-white/5 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. Settlement</div>
                                        <div className="text-white font-mono text-sm">Dec 12 - Dec 14</div>
                                    </div>
                                    <div className="w-20 h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Automated Updates (Medium) */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="relative z-10 mb-4">
                            <h3 className="text-xl font-bold text-white mb-2">Zero Support Tickets</h3>
                            <p className="text-gray-400 text-sm">
                                Automated email updates at every step.
                            </p>
                        </div>

                        {/* Visual: Email Notification */}
                        <div className="flex-1 bg-[#111] rounded-xl border border-white/10 p-5 flex flex-col justify-center transform group-hover:translate-y-[-5px] transition-transform duration-300 mt-4">
                            {/* Simulated Email Header */}
                            <div className="flex items-center gap-3 mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">R</div>
                                <div>
                                    <div className="text-xs text-white font-medium">Refund Update</div>
                                    <div className="text-[10px] text-gray-500">to me</div>
                                </div>
                            </div>
                            {/* Simulated Email Body */}
                            <div className="space-y-2">
                                <div className="h-2 w-3/4 bg-gray-800 rounded animate-pulse"></div>
                                <div className="h-2 w-full bg-gray-800 rounded animate-pulse delay-75"></div>
                                <div className="h-2 w-5/6 bg-gray-800 rounded animate-pulse delay-150"></div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="h-8 w-full bg-blue-500/10 rounded flex items-center justify-center text-xs text-blue-400 font-medium">
                                    Track Refund Status
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Failure Recovery (Medium) */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="relative z-10 mb-4">
                            <h3 className="text-xl font-bold text-white mb-2">Failure Recovery</h3>
                            <p className="text-gray-400 text-sm">
                                Automatically collect correct <span className="text-white font-medium">UPI ID</span> if a refund fails.
                            </p>
                        </div>

                        {/* Visual: Failure -> Success Input */}
                        <div className="flex-1 relative mt-4">
                            {/* State 1: Failed (Visible initially) */}
                            <div className="absolute inset-0 bg-[#1A0505] border border-red-500/20 rounded-xl p-4 flex flex-col justify-center group-hover:opacity-0 transition-opacity duration-300">
                                <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Refund Failed
                                </div>
                                <div className="text-xs text-red-500/60">Invalid UPI ID provided.</div>
                            </div>

                            {/* State 2: Success Input (Visible on Hover) */}
                            <div className="absolute inset-0 bg-[#051A05] border border-green-500/20 rounded-xl p-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="text-xs text-green-400 mb-2 font-medium">✓ Secure Link Sent</div>
                                <div className="bg-[#0A0A0A] border border-white/10 rounded px-3 py-2 flex items-center justify-between">
                                    <div className="text-xs text-white">shuva@okhdfcbank</div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
