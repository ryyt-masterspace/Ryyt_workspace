"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ConciergeAvatar from "./ConciergeAvatar";
import ChatWindow from "./ChatWindow";

export default function GlobalConcierge() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isIdle, setIsIdle] = useState(false);

    // Hide on Auth pages (Login/Register) if needed, currently showing everywhere
    const isHidden = false;

    // Idle Detection (Trigger "Nudge" after 30s)
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const resetIdle = () => {
            setIsIdle(false);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsIdle(true), 30000); // 30s
        };

        // Listen for activity
        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('scroll', resetIdle);
        window.addEventListener('keydown', resetIdle);
        window.addEventListener('click', resetIdle);

        // Init
        resetIdle();

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('scroll', resetIdle);
            window.removeEventListener('keydown', resetIdle);
            window.removeEventListener('click', resetIdle);
        };
    }, []);

    // Close chat on page navigation? (Optional, currently keeping generic)
    // useEffect(() => setIsOpen(false), [pathname]);

    if (isHidden) return null;

    return (
        <>
            <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <ConciergeAvatar
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                isIdle={isIdle}
            />
        </>
    );
}
