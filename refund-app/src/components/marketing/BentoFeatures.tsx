'use client';
import { motion } from 'framer-motion';
import { Wallet, PhoneOff, MailWarning } from 'lucide-react';

export default function BentoFeatures() {
    const features = [
        {
            icon: Wallet,
            title: "The Empty Wallet Trap",
            pain: "Razorpay took all my money in settlement. Now I can't refund.",
            fix: "Just-in-Time Funding. Scan a QR code to pay instantly from your bank.",
            color: "text-red-400"
        },
        {
            icon: PhoneOff,
            title: "The Phone Tag Nightmare",
            pain: "Wasting hours calling customers for bank details.",
            fix: "Auto-Pilot Collector. We text them, they enter UPI, you approve.",
            color: "text-orange-400"
        },
        {
            icon: MailWarning,
            title: "The Angry Inbox",
            pain: "Support spam asking 'Where is my money?'",
            fix: "The FedEx for Money. Live tracking links for every refund.",
            color: "text-yellow-400"
        }
    ];

    return (
        <section id="features" className="py-20 relative z-10 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">The End of Your Headaches.</h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Why is giving money back harder than taking it? <br /> Ryyt replaces the chaos with a simple, automated workflow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-[#0052FF]/50 hover:shadow-[0_0_30px_-10px_rgba(0,82,255,0.3)] transition-all duration-500 group relative overflow-hidden"
                        >
                            {/* Card Inner Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0052FF]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0052FF] transition-colors duration-300 border border-white/5">
                                <f.icon className="text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-6">{f.title}</h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl group-hover:border-red-500/20 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">The Pain</p>
                                    </div>
                                    <p className="text-sm text-zinc-400 leading-relaxed">"{f.pain}"</p>
                                </div>

                                <div className="p-4 bg-[#0052FF]/5 border border-[#0052FF]/10 rounded-xl group-hover:bg-[#0052FF]/10 group-hover:border-[#0052FF]/30 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0052FF]" />
                                        <p className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0052FF] to-cyan-400 uppercase tracking-wider">The Ryyt Fix</p>
                                    </div>
                                    <p className="text-sm text-zinc-200 leading-relaxed font-medium">{f.fix}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
