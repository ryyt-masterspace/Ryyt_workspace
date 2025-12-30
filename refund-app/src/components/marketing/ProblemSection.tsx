"use client";

export default function ProblemSection() {
    return (
        <section className="py-32 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        You take payments in seconds. <br />
                        <span className="text-gray-500">Refunds take 7 days.</span>
                    </h2>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        The <span className="text-white font-medium">&quot;Velocity Mismatch&quot;</span> creates a black box where money disappears.
                        Your customer thinks you&apos;re a scammer. You&apos;re just waiting for the bank.
                    </p>
                </div>

                {/* The 3 Villains Grid */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Card 1: The Support Tax */}
                    <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">The &quot;WISMR&quot; Tax</h3>
                        <p className="text-gray-400 leading-relaxed">
                            <span className="text-white font-medium">60%</span> of your support tickets are &quot;Where Is My Refund?&quot;.
                            Each ticket costs you <span className="text-white font-medium">₹50-₹200</span> to resolve, bleeding your margins dry on orders you already lost.
                        </p>
                    </div>

                    {/* Card 2: The Data Silo */}
                    <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">The Data Black Box</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Logistics knows it&apos;s picked up. The Gateway knows it&apos;s initiated. The Bank knows it&apos;s settled.
                            <span className="text-white font-medium"> None of them talk to each other.</span> You are left blind, unable to prove you&apos;ve paid.
                        </p>
                    </div>

                    {/* Card 3: The Liquidity Trap */}
                    <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">The Liquidity Trap</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Daily payouts leave your balance at zero. Refunds get stuck in <span className="text-white font-medium">&quot;Pending&quot;</span>
                            until new sales come in. You can&apos;t pay because the system won&apos;t let you top up.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
