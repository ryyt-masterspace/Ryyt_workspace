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

    // Reusable Avatar Circle Component
    const AvatarCircle = ({ children, color = "bg-[#111]" }: { children: React.ReactNode, color?: string }) => (
        <div className={`w-12 h-12 rounded-full ${color} border-2 border-[#050505] flex items-center justify-center shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
            {children}
        </div>
    );

    return (
        <div ref={ref} className="flex flex-col items-center justify-center py-24 space-y-6 relative z-10 w-full">

            {/* Text */}
            <p className="text-lg text-gray-400 font-medium">
                Join <span className="text-white font-bold tabular-nums">{count}+</span> brands building trust
            </p>

            {/* Overlapping Avatars Row */}
            <div className="flex items-center -space-x-4">

                {/* Avatar 1: Hex */}
                <AvatarCircle>
                    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                        <path d="M20 5L33 12.5V27.5L20 35L7 27.5V12.5L20 5Z" stroke="white" strokeWidth="3" />
                    </svg>
                </AvatarCircle>

                {/* Avatar 2: Wave */}
                <AvatarCircle>
                    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                        <path d="M2 20C8 20 8 10 14 10C20 10 20 30 26 30C32 30 32 20 38 20" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </AvatarCircle>

                {/* Avatar 3: Dots */}
                <AvatarCircle>
                    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                        <circle cx="8" cy="8" r="4" fill="white" />
                        <circle cx="32" cy="8" r="4" fill="white" />
                        <circle cx="8" cy="32" r="4" fill="white" />
                        <circle cx="32" cy="32" r="4" fill="white" />
                    </svg>
                </AvatarCircle>

                {/* Avatar 4: Layers */}
                <AvatarCircle>
                    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                        <rect x="5" y="5" width="20" height="20" rx="4" stroke="white" strokeWidth="3" />
                        <rect x="15" y="15" width="20" height="20" rx="4" fill="white" fillOpacity="0.5" />
                    </svg>
                </AvatarCircle>

                {/* Avatar 5: Orbit */}
                <AvatarCircle>
                    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="16" stroke="white" strokeWidth="3" strokeDasharray="6 6" />
                        <circle cx="20" cy="20" r="6" fill="white" />
                    </svg>
                </AvatarCircle>

                {/* Avatar 6: Lightning (Accent) */}
                <AvatarCircle color="bg-blue-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </AvatarCircle>

            </div>
        </div>
    );
}
