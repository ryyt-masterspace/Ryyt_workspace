"use client";

import { useEffect, useState, useRef } from "react";

const AbstractLogos = () => (
    <div className="flex gap-20 items-center opacity-60 grayscale-0">
        {/* Abstract Shape 1: Hex Node (Filled) */}
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="w-12 h-12">
            <path d="M20 5L33 12.5V27.5L20 35L7 27.5V12.5L20 5Z" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="2" />
            <circle cx="20" cy="20" r="6" fill="white" />
        </svg>

        {/* Abstract Shape 2: Wave (Thick) */}
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="w-14 h-10">
            <path d="M2 20C8 20 8 10 14 10C20 10 20 30 26 30C32 30 32 20 38 20" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </svg>

        {/* Abstract Shape 3: Connected Dots (Solid) */}
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="w-12 h-12">
            <rect x="4" y="4" width="12" height="12" rx="2" fill="white" />
            <rect x="24" y="4" width="12" height="12" rx="2" fill="white" fillOpacity="0.3" />
            <rect x="4" y="24" width="12" height="12" rx="2" fill="white" fillOpacity="0.3" />
            <rect x="24" y="24" width="12" height="12" rx="2" fill="white" />
        </svg>

        {/* Abstract Shape 4: Layers (Filled) */}
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="w-12 h-12">
            <rect x="5" y="5" width="20" height="20" rx="4" fill="white" fillOpacity="0.2" />
            <rect x="15" y="15" width="20" height="20" rx="4" fill="white" />
        </svg>

        {/* Abstract Shape 5: Orbit (Thick) */}
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="w-12 h-12">
            <circle cx="20" cy="20" r="16" stroke="white" strokeWidth="3" strokeDasharray="6 6" />
            <circle cx="20" cy="20" r="6" fill="white" />
        </svg>

        {/* Abstract Shape 6: Bar Chart (Solid) */}
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="w-12 h-12">
            <rect x="6" y="20" width="8" height="14" rx="2" fill="white" fillOpacity="0.5" />
            <rect x="18" y="8" width="8" height="26" rx="2" fill="white" />
            <rect x="30" y="14" width="8" height="20" rx="2" fill="white" fillOpacity="0.5" />
        </svg>
        {/* Abstract Shape 7: Infinity (Thick) */}
        <svg width="60" height="40" viewBox="0 0 50 30" fill="none" className="w-16 h-10">
            <path d="M10 15C10 9.47715 14.4772 5 20 5C22.5 5 24.5 6 26 8C27.5 6 29.5 5 32 5C37.5228 5 42 9.47715 42 15C42 20.5228 37.5228 25 32 25C29.5 25 27.5 24 26 22C24.5 24 22.5 25 20 25C14.4772 25 10 20.5228 10 15Z" stroke="white" strokeWidth="4" />
        </svg>
    </div>
);

export default function SocialProof() {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let start = 0;
        const end = 500;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isVisible]);

    return (
        <div ref={ref} className="flex flex-col items-center justify-center py-24 space-y-12 relative z-10 w-full overflow-hidden">
            {/* Stats */}
            <div className="text-center space-y-4 relative z-20">
                <div className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tabular-nums">
                    {count}+
                </div>
                <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide">
                    Trusted by leading brands
                </p>
            </div>

            {/* Abstract Marquee */}
            <div className="w-full relative">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>

                <div className="flex w-max animate-marquee gap-16">
                    {/* Double the logos for seamless loop */}
                    <AbstractLogos />
                    <AbstractLogos />
                    <AbstractLogos />
                    <AbstractLogos />
                </div>
            </div>
        </div>
    );
}
