'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, animate } from 'framer-motion';
import { ArrowRight, Search, Smartphone, Zap } from 'lucide-react';
import Image from 'next/image';

import { useModal } from '@/context/ModalContext';

export default function FinalHero() {
    const { openLeadModal } = useModal();
    return (
        <section className="relative w-full pt-32 pb-20 flex flex-col items-center justify-center perspective-[2000px] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-[#0052FF]/15 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 text-center mb-12 relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
                >
                    Make Refunds<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#0052FF] to-blue-400">
                        Seamless, Not Stressful.
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    No more chasing COD customers for UPI IDs or guessing refund status. Ryyt automates collection, communication, and tracking. We turn refund chaos into trust-building moments for your D2C brand.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={openLeadModal}
                        className="px-8 py-4 bg-[#0052FF]/60 backdrop-blur-xl border border-[#0052FF]/50 shadow-[0_0_20px_-5px_rgba(0,82,255,0.5)] hover:bg-[#0052FF]/80 hover:shadow-[0_0_30px_-5px_rgba(0,82,255,0.6)] hover:border-[#0052FF]/80 text-white font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        Regain Control <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:border-white/20 text-white font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                    >
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
                        <Image width={32} height={32} src="/assets/avatars/user1.svg" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-blue-500" />
                        <Image width={32} height={32} src="/assets/avatars/user2.svg" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-purple-500" />
                        <Image width={32} height={32} src="/assets/avatars/user3.svg" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-emerald-500" />
                        <Image width={32} height={32} src="/assets/avatars/user4.svg" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-pink-500" />
                    </div>
                    <p>
                        Trusted by <span className="font-bold text-white"><Counter value={1200} />+</span> D2C Founders & Brands
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

// Sub-components for slides
function AnalyticsMockup() {
    return (
        <div className="w-full h-full flex gap-4">
            {/* Left: Main Chart Card */}
            <div className="flex-[2] bg-zinc-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 flex flex-col relative overflow-hidden group">
                {/* Engineering Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-start mb-4 z-10">
                    <div>
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Settled</div>
                        <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-2">
                            ₹4.2L <span className="text-xs font-normal text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">+12.5%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-950/80 rounded-full px-2 py-1 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] font-bold text-emerald-500 tracking-wide">LIVE</span>
                    </div>
                </div>

                {/* Animated Area Chart */}
                <div className="flex-1 relative w-full h-full min-h-[80px]">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d="M0,50 L0,35 C15,35 20,20 30,22 C40,24 45,35 55,35 C65,35 70,10 80,12 C90,14 95,25 100,20 L100,50 Z"
                            fill="url(#chartGradient)"
                            initial={{ opacity: 0, pathLength: 0 }}
                            animate={{ opacity: 1, pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <motion.path
                            d="M0,35 C15,35 20,20 30,22 C40,24 45,35 55,35 C65,35 70,10 80,12 C90,14 95,25 100,20"
                            fill="none"
                            stroke="#4F46E5"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            filter="drop-shadow(0 0 6px rgba(79, 70, 229, 0.6))"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>
                </div>
            </div>

            {/* Right: Metrics Stack */}
            <div className="flex-1 flex flex-col gap-3">
                {/* Metric 1: Success Rate */}
                <div className="flex-1 bg-zinc-900/80 backdrop-blur-md rounded-xl border border-white/10 p-4 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full" />
                    <div className="relative z-10">
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Success Rate</div>
                        <div className="text-3xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">99.8%</div>
                    </div>
                </div>

                {/* Metric 2: Identity Guard */}
                <div className="flex-[1.2] bg-[#0052FF]/10 backdrop-blur-md rounded-xl border border-[#0052FF]/30 p-4 flex flex-col justify-center relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 rounded bg-[#0052FF]/20">
                            {/* Shield Icon SVG */}
                            <svg className="w-3 h-3 text-[#0052FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <span className="text-[9px] font-bold text-[#0052FF] uppercase tracking-widest">Identity Guard</span>
                    </div>
                    <div className="text-2xl font-bold text-white">1,240</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Threats Intercepted</div>
                </div>
            </div>
        </div>
    );
}

function TableMockup() {
    const rows = [
        { id: "101", customer: "Arjun K.", amount: "₹1,200", status: "GATHERING DATA", lastAction: "UPI Link Sent", color: "text-amber-400 bg-amber-400/5 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]" },
        { id: "102", customer: "Sarah L.", amount: "₹850", status: "REFUND INITIATED", lastAction: "Identity Verified", color: "text-blue-400 bg-blue-400/5 border-blue-400/20 shadow-[0_0_10px_rgba(96,165,250,0.1)]" },
        { id: "103", customer: "Dev P.", amount: "₹2,400", status: "SETTLED", lastAction: "UTR #7858... Generated", color: "text-emerald-400 bg-emerald-400/5 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]" },
        { id: "104", customer: "Rohan D.", amount: "₹450", status: "SETTLED", lastAction: "UTR #9921... Generated", color: "text-emerald-400 bg-emerald-400/5 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]" }
    ];

    return (
        <div className="w-full h-full bg-white/[0.03] rounded-lg border border-white/5 flex flex-col relative overflow-hidden">
            {/* Scanning Light Effect */}
            <motion.div
                initial={{ top: "-20%" }}
                animate={{ top: "120%" }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-24 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none z-0"
            />

            <div className="h-10 border-b border-white/5 flex items-center px-6 gap-4 text-xs text-zinc-500 font-bold uppercase bg-white/[0.02] z-10 relative">
                <div className="w-1/5 tracking-widest">Order</div>
                <div className="w-1/4 tracking-widest">Customer</div>
                <div className="w-1/5 text-right tracking-widest">Amount</div>
                <div className="w-1/3 text-center tracking-widest">Status / Logic</div>
            </div>

            <div className="flex-1 overflow-hidden z-10 relative">
                {rows.map((row, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 + 0.2 }}
                        className="h-[72px] border-b border-white/5 flex items-center px-6 gap-4 text-sm hover:bg-white/[0.06] transition-colors"
                    >
                        {/* Order ID */}
                        <div className="w-1/5 text-blue-400/80 font-mono text-[10px] tracking-wide drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">#ORD-{row.id}</div>

                        {/* Customer + Shield */}
                        <div className="w-1/4 flex items-center gap-2 overflow-hidden">
                            {(row.status === "SETTLED" || row.status === "REFUND INITIATED") && (
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }} title="Identity Verified">
                                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                </motion.div>
                            )}
                            <span className="text-zinc-200 font-medium truncate text-sm">{row.customer}</span>
                        </div>

                        {/* Amount */}
                        <div className="w-1/5 text-right text-white font-mono font-bold tracking-tight">{row.amount}</div>

                        {/* Status + Last Action */}
                        <div className="w-1/3 flex flex-col items-center gap-1.5">
                            <div className={`px-3 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1.5 ${row.color} backdrop-blur-sm`}>
                                {row.status === "GATHERING DATA" && (
                                    <svg className="animate-spin h-2 w-2 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {row.status}
                            </div>
                            <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-tighter">{row.lastAction}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function QRMockup() {
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setVerified(prev => !prev);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex rounded-xl overflow-hidden border border-white/10 bg-black relative group">
            {/* Background Binary Rain */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden font-mono text-[10px] text-[#0052FF] leading-3 whitespace-pre select-none flex flex-col">
                <motion.div
                    animate={{ y: ["-50%", "0%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {Array(40).fill("0101101001 1001010110 1101010010 0101101101").join("\n")}
                    {"\n"}
                    {Array(40).fill("1101010010 0101101101 0101101001 1001010110").join("\n")}
                </motion.div>
            </div>

            {/* Left: Sidebar */}
            <div className="w-1/3 border-r border-white/10 bg-zinc-900/50 p-4 space-y-3 z-10 backdrop-blur-sm">
                <div className="h-12 w-full bg-[#0052FF]/10 border border-[#0052FF]/30 rounded flex items-center px-3 gap-3">
                    <div className="relative w-2 h-2">
                        <div className="absolute inset-0 bg-[#0052FF] rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-2 h-2 bg-[#0052FF] rounded-full"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="h-1.5 w-16 bg-[#0052FF]/40 rounded" />
                        <div className="h-1.5 w-10 bg-[#0052FF]/20 rounded" />
                    </div>
                </div>
                <div className="h-12 w-full bg-zinc-800/30 rounded border border-white/5 animate-pulse" />
                <div className="h-12 w-full bg-zinc-800/30 rounded border border-white/5" />
            </div>

            {/* Right: Security Stage */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">

                {/* Holographic Card */}
                <div className="relative w-64 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-8 overflow-hidden shadow-2xl group-hover:border-[#0052FF]/30 transition-colors">
                    {/* Laser Scan Beam */}
                    <motion.div
                        animate={{ top: ["-10%", "120%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-0.5 bg-[#4F46E5] shadow-[0_0_25px_#4F46E5] z-20"
                    />

                    {/* Card Content */}
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
                        <div className="text-[9px] font-mono text-emerald-500 tracking-widest animate-pulse flex items-center gap-1">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                            [ ENCRYPTED_SESSION ]
                        </div>
                        {/* Lock Icon SVG */}
                        <svg className="w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">Customer Identity</div>
                            <div className="font-mono text-white text-base tracking-wider">s*******@gmail.com</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">Refund Reference</div>
                            <div className="font-mono text-zinc-300 text-xs flex justify-between">
                                <span>#R-138-XQ9</span>
                                <span className="text-zinc-600">via API</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification Button */}
                <button
                    className={`relative overflow-hidden px-6 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all duration-500 flex items-center gap-2 ${verified
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : "bg-[#0052FF] text-white border border-[#0052FF] shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                        }`}
                >
                    {/* Shimmer Effect */}
                    {!verified && (
                        <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                        />
                    )}

                    {verified ? (
                        <>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            IDENTITY VERIFIED
                        </>
                    ) : (
                        <>
                            <Zap size={14} className="fill-current" />
                            VERIFYING IDENTITY...
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

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
