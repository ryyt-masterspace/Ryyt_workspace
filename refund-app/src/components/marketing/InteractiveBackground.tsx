"use client";

import { useEffect, useRef } from "react";

export default function InteractiveBackground() {
    const blobRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!blobRef.current) return;

            const { clientX, clientY } = e;

            blobRef.current.animate(
                {
                    left: `${clientX}px`,
                    top: `${clientY}px`,
                },
                { duration: 3000, fill: "forwards" }
            );
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Background */}
            <div className="absolute inset-0 bg-[#050505]"></div>

            {/* Moving Blob (Cursor Follower) */}
            <div
                ref={blobRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-[120px] opacity-70"
            ></div>

            {/* Secondary Ambient Blob (Slow Drift) */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] animate-pulse"></div>

            {/* Noise Overlay for Texture (Optional, kept subtle) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/assets/noise.png')]"></div>
        </div>
    );
}
