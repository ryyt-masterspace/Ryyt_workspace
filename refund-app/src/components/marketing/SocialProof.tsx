"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Reusable Avatar Circle Component
const AvatarCircle = ({ src, alt, color = "bg-[#111]" }: { src?: string, alt?: string, color?: string }) => (
    <div className={`w-12 h-12 rounded-full ${color} border-2 border-[#050505] flex items-center justify-center shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
        {src ? (
            <Image
                src={src}
                alt={alt || "Avatar"}
                width={48}
                height={48}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
        ) : (
            <div className="flex items-center justify-center w-full h-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            </div>
        )}
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
        const end = 1200;
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
        <div ref={ref} className="flex flex-col items-center justify-center py-24 space-y-6 relative z-10 w-full">

            {/* Text */}
            <p className="text-lg text-gray-400 font-medium">
                Join <span className="text-white font-bold tabular-nums">{count}+</span> founders who trust us
            </p>

            {/* Overlapping Avatars Row */}
            <div className="flex items-center -space-x-4">

                <AvatarCircle src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Founder 1" />
                <AvatarCircle src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces" alt="Founder 2" />
                <AvatarCircle src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" alt="Founder 3" />
                <AvatarCircle src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" alt="Founder 4" />
                <AvatarCircle src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces" alt="Founder 5" />

                {/* Avatar 6: Lightning (Accent) */}
                <AvatarCircle color="bg-blue-600" />

            </div>
        </div>
    );
}
