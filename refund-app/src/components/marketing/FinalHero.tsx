'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, animate } from 'framer-motion';
import { ArrowRight, Search, Smartphone, Zap } from 'lucide-react';

export default function FinalHero({ onOpenLead }: { onOpenLead?: () => void }) {
    return (
        <section className="relative w-full pt-32 pb-20 flex flex-col items-center justify-center perspective-[2000px] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-[#0052FF]/15 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 text-center mb-12 relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
                >
                    Stop apologizing for your<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#0052FF] to-blue-400">
                        Payment Gateway's delays.
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Your customers deserve their money back now, not in 3 days. Ryyt lets you bypass the settlement cycle, automate COD payouts, and regain control of your cash flow.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={onOpenLead}
                        className="px-8 py-4 bg-[#0052FF]/60 backdrop-blur-xl border border-[#0052FF]/50 shadow-[0_0_20px_-5px_rgba(0,82,255,0.5)] hover:bg-[#0052FF]/80 hover:shadow-[0_0_30px_-5px_rgba(0,82,255,0.6)] hover:border-[#0052FF]/80 text-white font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        Regain Control <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:border-white/20 text-white font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2">
                        How it works
                    </button>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-500"
                >
                    <div className="flex -space-x-3">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0A0A0A]" />
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0A0A0A]" />
                        <img src="https://randomuser.me/api/portraits/men/86.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0A0A0A]" />
                        <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0A0A0A]" />
                    </div>
                    <p>
                        Join <span className="font-bold text-white"><Counter value={1200} />+</span> founders trusting Ryyt.
                    </p>
                </motion.div>
            </div>

            {/* 3D Dashboard */}
            <div className="mt-16 w-full">
                <InteractiveDashboard />
            </div>
        </section>
    );
}

function InteractiveDashboard() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % 3), 5000);
        return () => clearInterval(timer);
    }, []);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <motion.div
            ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ delay: 0.5, duration: 1 }}
            className="relative mx-auto max-w-6xl h-[600px] w-full z-20 px-4"
        >
            {/* --- THE HALO GLOW EFFECT --- */}

            {/* Layer 1: The "Atmosphere" (Wide & Soft) */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#0052FF]/10 blur-[100px] rounded-full -z-10 pointer-events-none"
            />

            {/* Layer 2: The "Core" (Tight & Bright) */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-[#0052FF]/30 to-purple-500/30 blur-[60px] rounded-full -z-10 animate-pulse pointer-events-none"
                style={{ animationDuration: '4s' }}
            />

            {/* Layer 3: The "Rim" (Subtle Edge Highlight) */}
            <div className="absolute -inset-1 bg-gradient-to-b from-[#0052FF]/20 to-transparent rounded-xl blur-md -z-10 opacity-50" />
            <div className="w-full h-full bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col">
                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                    <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500/20" /><div className="w-3 h-3 rounded-full bg-yellow-500/20" /><div className="w-3 h-3 rounded-full bg-green-500/20" /></div>
                    <div className="w-96 h-9 bg-zinc-900/50 rounded-lg border border-white/5 flex items-center px-4 text-xs text-zinc-600"><Search size={14} className="mr-2" /> Search...</div>
                </div>
                <div className="relative flex-1 w-full overflow-hidden bg-zinc-950/50">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentSlide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="absolute inset-0 p-8 flex items-center justify-center">
                            {currentSlide === 0 && <AnalyticsMockup />}
                            {currentSlide === 1 && <TableMockup />}
                            {currentSlide === 2 && <QRMockup />}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="h-12 border-t border-white/5 flex items-center justify-center gap-3">
                    {[0, 1, 2].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-[#0052FF]' : 'w-2 bg-zinc-800'}`} />)}
                </div>
            </div>
        </motion.div>
    );
}

// Sub-components for slides (Simplified for reliability)
function AnalyticsMockup() { return <div className="w-full h-full flex gap-6"><div className="flex-1 bg-white/[0.03] rounded-lg border border-white/5 p-6 flex flex-col justify-end gap-2"><div className="text-3xl font-bold text-white">₹4.2L</div><div className="text-sm text-zinc-500">Total Refunded</div><div className="h-32 flex items-end gap-2 mt-4">{[40, 70, 50, 90, 60, 80].map((h, i) => <div key={i} className="flex-1 bg-[#0052FF]/20 rounded-t" style={{ height: `${h}%` }} />)}</div></div><div className="w-1/3 flex flex-col gap-6"><div className="flex-1 bg-white/[0.03] rounded-lg border border-white/5 p-6"><div className="text-sm text-zinc-500">Success Rate</div><div className="text-4xl font-bold text-emerald-400 mt-2">99.8%</div></div><div className="flex-1 bg-white/[0.03] rounded-lg border border-white/5 p-6"><div className="text-sm text-zinc-500">SLA Breaches</div><div className="text-4xl font-bold text-zinc-700 mt-2">0</div></div></div></div> }
function TableMockup() { return <div className="w-full h-full bg-white/[0.03] rounded-lg border border-white/5 flex flex-col"><div className="h-10 border-b border-white/5 flex items-center px-6 gap-4 text-xs text-zinc-500 font-bold uppercase"><div className="w-1/4">Order</div><div className="w-1/4">Customer</div><div className="w-1/4 text-right">Amount</div><div className="w-1/4 text-center">Status</div></div>{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 border-b border-white/5 flex items-center px-6 gap-4 text-sm"><div className="w-1/4 text-white font-mono">#ORD-{100 + i}</div><div className="w-1/4 text-zinc-400">Customer {i}</div><div className="w-1/4 text-right text-white font-mono">₹{(i * 500).toLocaleString()}</div><div className="w-1/4 flex justify-center"><div className="px-3 py-1 rounded-full bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-bold border border-[#0052FF]/20">INITIATED</div></div></div>)}</div> }
function QRMockup() { return <div className="w-full h-full flex rounded-xl overflow-hidden border border-white/10 bg-black"><div className="w-1/3 border-r border-white/10 bg-zinc-900/50 p-4 space-y-3"><div className="h-12 w-full bg-[#0052FF]/10 border border-[#0052FF]/30 rounded flex items-center px-3"><div className="w-2 h-2 rounded-full bg-[#0052FF] mr-3" /><div className="h-2 w-20 bg-[#0052FF]/30 rounded" /></div><div className="h-12 w-full bg-zinc-800/30 rounded" /><div className="h-12 w-full bg-zinc-800/30 rounded" /></div><div className="flex-1 flex flex-col items-center justify-center relative"><div className="text-center mb-6"><div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Paying Refund #R-138</div><div className="text-4xl font-mono font-bold text-white">₹2,000.00</div></div><div className="bg-white p-4 rounded-xl mb-6"><Smartphone className="text-black w-32 h-32 opacity-80" strokeWidth={1} /></div><button className="px-6 py-3 bg-[#0052FF] text-white font-bold rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2"><Zap size={16} /> Simulate Payment</button></div></div> }

function Counter({ value }: { value: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, value, {
            duration: 2,
            onUpdate(value) {
                node.textContent = Math.round(value).toLocaleString();
            }
        });

        return () => controls.stop();
    }, [value]);

    return <span ref={nodeRef} />;
}
