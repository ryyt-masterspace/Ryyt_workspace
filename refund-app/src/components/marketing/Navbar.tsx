'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 20);
    });

    return (
        <motion.nav
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
                ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 py-4'
                : 'bg-transparent border-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 cursor-pointer z-50">
                    {/* Safe Logo Loading */}
                    <div className="relative h-11 w-48">
                        <Image
                            src="/logo-white.png"
                            alt="Ryyt"
                            fill
                            className="object-contain object-left"
                            onError={(e) => {
                                // Fallback to text if image missing
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.parentElement?.nextElementSibling as HTMLElement | null;
                                if (nextSibling) {
                                    nextSibling.style.display = 'block';
                                }
                            }}
                        />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tighter hidden">Ryyt</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    <Link href="#features" className="hover:text-white transition-colors">Solutions</Link>
                    <Link href="#why-us" className="hover:text-white transition-colors">Why Ryyt</Link>
                    <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Login</Link>
                    <Link href="/login" className="text-sm font-medium px-5 py-2.5 rounded-full bg-[#0052FF]/60 backdrop-blur-xl border border-[#0052FF]/50 shadow-[0_0_20px_-5px_rgba(0,82,255,0.5)] hover:bg-[#0052FF]/80 hover:shadow-[0_0_30px_-5px_rgba(0,82,255,0.6)] hover:border-[#0052FF]/80 text-white transition-all duration-300">
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
