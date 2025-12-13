'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

import { useModal } from '@/context/ModalContext';

// 2. Destructure Prop
export default function Navbar() {
    const { openLeadModal } = useModal();
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

                {/* Logo Home Link */}
                <Link href="/" className="flex items-center gap-2 cursor-pointer z-50">
                    <div className="relative h-11 w-48">
                        <Image
                            src="/logo-white.png"
                            alt="Ryyt"
                            fill
                            className="object-contain object-left"
                            priority
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    <Link href="#features" className="hover:text-white transition-colors">Solutions</Link>
                    <Link href="#why-us" className="hover:text-white transition-colors">Why Ryyt</Link>
                    <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
                    <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                        Login
                    </Link>

                    {/* 3. The Fixed Button */}
                    <button
                        onClick={openLeadModal}
                        className="text-sm font-medium px-5 py-2.5 rounded-full bg-[#0052FF] text-white hover:bg-[#0040DD] shadow-lg shadow-blue-900/20 transition-all"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </motion.nav>
    );
}
