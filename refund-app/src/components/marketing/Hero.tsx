'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Search, User, Smartphone, CreditCard, Zap } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative w-full pt-32 pb-40 flex flex-col items-center justify-center perspective-[2000px] z-10">

            {/* 1. THE MASSIVE GLOW (Electric Blue) */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] rounded-full bg-[#0052FF]/20 blur-[120px] pointer-events-none" />

            {/* 2. TEXT CONTENT */}
            <div className="container mx-auto px-4 text-center mb-20 relative z-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
                >
                    Refund Instantly.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#0052FF] to-blue-500 drop-shadow-[0_0_15px_rgba(0,82,255,0.5)]">
                        Gateway Balance is Zero.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
                >
                    Stop waiting for new sales. Process refunds directly from your bank account, automate COD payouts, and stop the &quot;Where is my money?&quot; emails forever.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button className="px-8 py-4 bg-[#0052FF] hover:bg-[#0040DD] text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 group">
                        Start Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-medium rounded-full transition-all">
                        Book Demo
                    </button>
                </motion.div>
            </div>

            {/* 3. THE 3D INTERACTIVE PLAYGROUND */}
            <InteractiveDashboard />

        </section>
    );
}

function InteractiveDashboard() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    // Auto-cycle slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative mx-auto max-w-5xl h-[500px] w-[90%] md:w-full group z-20"
        >
            {/* GLASS CONTAINER */}
            <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col">

                {/* Header Mockup */}
                <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-64 h-8 bg-zinc-800/50 rounded-lg border border-white/5 flex items-center px-3 text-xs text-zinc-600">
                            <Search size={14} className="mr-2 opacity-50" /> Search...
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                            <User size={14} />
                        </div>
                    </div>
                </div>

                {/* SLIDER CONTENT */}
                <div className="relative flex-1 w-full overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 p-6 flex flex-col"
                        >
                            {currentSlide === 0 && <AnalyticsMockup />}
                            {currentSlide === 1 && <TableMockup />}
                            {currentSlide === 2 && <QRMockup />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* PAGINATION DOTS */}
                <div className="h-10 border-t border-white/5 flex items-center justify-center gap-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-[#0052FF]' : 'w-2 bg-zinc-700'}`} />
                    ))}
                </div>
            </div>

            {/* BACK GLOW */}
            <div className="absolute -inset-10 bg-[#0052FF]/20 blur-[80px] -z-10 rounded-full opacity-50" />
        </motion.div>
    );
}

// --- SUB COMPONENTS ---

function AnalyticsMockup() {
    return (
        <div className="grid grid-cols-3 gap-6 h-full">
            <div className="col-span-2 bg-white/[0.02] rounded-lg border border-white/5 p-4 flex flex-col">
                <div className="h-4 w-32 bg-zinc-800/50 rounded mb-6" />
                <div className="flex-1 flex items-end gap-2 px-2">
                    {[40, 70, 50, 90, 60, 80, 50, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#0052FF]/20 border-t border-[#0052FF]/50 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
            <div className="col-span-1 flex flex-col gap-4">
                <div className="flex-1 bg-white/[0.02] rounded-lg border border-white/5 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3"><CreditCard className="text-zinc-700" size={20} /></div>
                    <div className="mt-auto">
                        <div className="text-2xl font-bold text-white">₹1.2L</div>
                        <div className="text-xs text-zinc-500">Total Settled</div>
                    </div>
                </div>
                <div className="flex-1 bg-white/[0.02] rounded-lg border border-white/5 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3"><Zap className="text-zinc-700" size={20} /></div>
                    <div className="mt-auto">
                        <div className="text-2xl font-bold text-emerald-400">98%</div>
                        <div className="text-xs text-zinc-500">Success Rate</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TableMockup() {
    return (
        <div className="w-full h-full bg-white/[0.02] rounded-lg border border-white/5 overflow-hidden flex flex-col">
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/5 text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                <div className="col-span-2">Order</div>
                <div>Amount</div>
                <div>Status</div>
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-white/5 items-center">
                    <div className="col-span-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800/50" />
                        <div className="h-3 w-24 bg-zinc-800 rounded" />
                    </div>
                    <div><div className="h-3 w-12 bg-zinc-800 rounded" /></div>
                    <div>
                        <div className={`h-5 w-20 rounded-full border flex items-center justify-center text-[9px] font-bold ${i === 1 ? 'bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/20' :
                            i === 2 ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                            {i === 1 ? 'INITIATED' : i === 2 ? 'PROCESSING' : 'SETTLED'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function QRMockup() {
    return (
        <div className="w-full h-full flex overflow-hidden rounded-lg border border-white/5 bg-zinc-900/50">
            {/* LIST SIDE */}
            <div className="w-1/3 border-r border-white/5 bg-white/[0.02] p-3 flex flex-col gap-2">
                <div className="h-2 w-16 bg-zinc-800 rounded mb-2 opacity-50" />
                <div className="h-10 w-full bg-zinc-800/50 rounded border border-white/5" />
                <div className="h-10 w-full bg-[#0052FF]/10 border border-[#0052FF]/30 rounded flex items-center px-2 relative">
                    <div className="w-1 h-4 bg-[#0052FF] rounded-full mr-2" />
                    <div className="h-2 w-12 bg-[#0052FF]/40 rounded" />
                </div>
                <div className="h-10 w-full bg-zinc-800/50 rounded border border-white/5" />
            </div>

            {/* DETAILS SIDE */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
                <div className="text-center mb-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Paying Refund #R-138</div>
                    <div className="text-2xl font-mono font-bold text-white">₹2,000.00</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-xl shadow-blue-900/20 mb-4">
                    <div className="w-24 h-24 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center">
                        <Smartphone className="text-zinc-900 opacity-20" size={32} />
                    </div>
                </div>
                <button className="px-4 py-2 bg-[#0052FF] hover:bg-[#0040DD] text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all">
                    <Zap size={12} /> Simulate Payment
                </button>
            </div>
        </div>
    );
}
