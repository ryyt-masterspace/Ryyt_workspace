"use client";

import { useEffect, useState, useRef } from "react";

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
        <div ref={ref} className="flex flex-col md:flex-row items-center justify-center py-20 gap-8 relative z-10 w-full">

            {/* 3 Static Abstract Logos */}
            <div className="flex items-center gap-4 opacity-50 grayscale mix-blend-screen">
                {/* Hex Node */}
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                    <path d="M20 5L33 12.5V27.5L20 35L7 27.5V12.5L20 5Z" stroke="white" strokeWidth="3" />
                    <circle cx="20" cy="20" r="4" fill="white" />
                </svg>
                {/* Connected Dots */}
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                    <circle cx="8" cy="8" r="4" fill="white" />
                    <circle cx="32" cy="8" r="4" fill="white" />
                    <circle cx="8" cy="32" r="4" fill="white" />
                    <circle cx="32" cy="32" r="4" fill="white" />
                    <path d="M8 8L32 32M32 8L8 32" stroke="white" strokeWidth="2" />
                </svg>
                {/* Layers */}
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                    <rect x="5" y="5" width="20" height="20" rx="4" stroke="white" strokeWidth="3" />
                    <rect x="15" y="15" width="20" height="20" rx="4" fill="white" fillOpacity="0.5" />
                </svg>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-white/20"></div>

            {/* Text with Counter */}
            <div className="text-lg md:text-xl text-gray-400 font-medium">
                Trusted by <span className="text-white font-bold tabular-nums">{count}+</span> leading brands
            </div>
        </div>
    );
}
