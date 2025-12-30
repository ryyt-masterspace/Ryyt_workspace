"use client";

import { motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ConciergeAvatarProps {
    isOpen: boolean;
    onClick: () => void;
    isIdle: boolean; // Triggers the "Peek" animation
}

export default function ConciergeAvatar({ isOpen, onClick, isIdle }: ConciergeAvatarProps) {
    const [isBlinking, setIsBlinking] = useState(false);

    // Random Blink Animation
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 200);
        }, 4000); // Blink every 4s
        return () => clearInterval(blinkInterval);
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

            {/* Intelligent Nudge (Frosted Glass) */}
            {!isOpen && isIdle && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-3 rounded-2xl rounded-br-none shadow-2xl text-xs font-medium max-w-[200px] mb-2 cursor-pointer"
                    onClick={onClick}
                >
                    <div className="flex gap-2 items-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        Bot Ryyt
                    </div>
                    <p className="mt-1 text-gray-300">I noticed you&apos;re browsing. Need a quick tour?</p>
                </motion.div>
            )}

            {/* The Avatar Button (Premium Glass Smiley) */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    y: [0, -6, 0] // Floating
                }}
                transition={{
                    y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.5 }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-md ${isOpen
                    ? "bg-[#0A0A0A] border border-white/20 text-white"
                    : "bg-gradient-to-tr from-blue-600/90 to-blue-500/90 border border-white/20 text-white"
                    }`}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <div className="relative">
                        {/* Abstract Face / Logo Mark */}
                        <div className="w-8 h-8 relative">
                            {/* Eyes */}
                            <motion.div
                                className="absolute top-2 left-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"
                                animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                            />
                            <motion.div
                                className="absolute top-2 right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"
                                animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                            />
                            {/* Smile */}
                            <div className="absolute bottom-2 left-1.5 w-5 h-2 border-b-2 border-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
                        </div>

                        {/* Glossy Reflection (Glass Effect) */}
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white/20 rounded-full blur-[2px]" />
                    </div>
                )}

                {/* Pulse Ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full border border-blue-400 opacity-0 animate-ping" />
                )}
            </motion.button>
        </div>
    );
}
