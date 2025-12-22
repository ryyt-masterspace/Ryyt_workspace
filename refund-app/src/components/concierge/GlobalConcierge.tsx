"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ConciergeAvatar from "./ConciergeAvatar";
import ChatWindow from "./ChatWindow";

/**
 * GlobalConcierge: Final Hook Alignment & Stable Positioning
 * Optimized for React lifecycle events and SSR hydration safety.
 */
export default function GlobalConcierge() {
    // 1. All hooks must be at the top level
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Stable Mounting Hook
    useEffect(() => {
        setMounted(true);
    }, []);

    // Stable Idle Detection Hook
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const resetIdle = () => {
            setIsIdle(false);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsIdle(true), 30000);
        };

        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('scroll', resetIdle);
        window.addEventListener('keydown', resetIdle);
        window.addEventListener('click', resetIdle);

        resetIdle();

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('scroll', resetIdle);
            window.removeEventListener('keydown', resetIdle);
            window.removeEventListener('click', resetIdle);
        };
    }, []);

    // 2. Logic defined after hooks
    const isLandingPage = pathname === "/" || pathname === "" || pathname === null;

    // 3. Conditional return at the very bottom
    if (!mounted || !isLandingPage) {
        return null;
    }

    return (
        <div
            id="ryyt-concierge-root"
            className="fixed bottom-6 right-6 z-[9999]"
        >
            <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <ConciergeAvatar
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                isIdle={isIdle}
            />
        </div>
    );
}
