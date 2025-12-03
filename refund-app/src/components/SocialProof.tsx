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
        const duration = 2000; // 2 seconds
        const increment = end / (duration / 16); // 60fps

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
        <div ref={ref} className="flex flex-col items-center justify-center py-24 space-y-4 relative z-10">
            <div className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tabular-nums">
                {count}+
            </div>
            <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide">
                Trusted by leading brands
            </p>
        </div>
    );
}
