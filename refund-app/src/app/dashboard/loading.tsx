'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center z-10"
            >
                {/* Logo Pulse */}
                <div className="relative w-48 h-12 mb-12">
                    <Image
                        src="/logo-white.png"
                        alt="Ryyt"
                        fill
                        className="object-contain"
                        priority
                    />
                    <motion.div
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"
                    />
                </div>

                {/* Secure Loading Indicator */}
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center justify-center min-w-[280px]">
                    <div className="relative mb-6">
                        <Loader2 className="animate-spin text-blue-500" size={40} strokeWidth={1.5} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Lock size={14} className="text-blue-500/50" />
                        </div>
                    </div>

                    <h2 className="text-white font-bold tracking-widest uppercase text-xs mb-2">Securing Session...</h2>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-tighter font-mono">
                        Validating Merchant Identity
                    </p>
                </div>

                <div className="mt-12 flex items-center gap-2 text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
                    <ShieldCheck size={12} /> Ryyt Vault Layer v2.5
                </div>
            </motion.div>
        </div>
    );
}
