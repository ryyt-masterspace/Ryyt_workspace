'use client';

import { motion } from 'framer-motion';

interface LegalWrapperProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}

export default function LegalWrapper({ title, lastUpdated, children }: LegalWrapperProps) {
    return (
        <section className="relative min-h-screen pt-40 pb-24 px-6 overflow-hidden bg-black">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#4F46E5]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-4xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 border-b border-white/10 pb-10"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
                        {title}
                    </h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                        Last Updated: <span className="text-indigo-400">{lastUpdated}</span>
                    </p>
                </motion.div>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-12 text-zinc-400 leading-relaxed text-lg"
                >
                    {children}
                </motion.div>

                {/* Automation Footer Section */}
                <div className="mt-20 pt-12 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">Entity Information</h3>
                            <div className="space-y-2 text-sm text-zinc-500">
                                <p><strong className="text-zinc-300">Company:</strong> Calcure Technologies Private Limited</p>
                                <p><strong className="text-zinc-300">Registered Office:</strong> 3 no. Basunagar, Madhyamgram, Kolkata 700129</p>
                                <p><strong className="text-zinc-300">Status:</strong> Registered Private Limited Company (India)</p>
                            </div>
                        </div>
                        <div className="bg-indigo-600/5 border border-indigo-500/10 p-6 rounded-2xl">
                            <h4 className="text-white font-semibold mb-2">Compliance & Trust</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed italic">
                                Ryyt is a technology platform provided by Calcure Technologies Private Limited. We adhere to the highest standards of data privacy and financial transparency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
