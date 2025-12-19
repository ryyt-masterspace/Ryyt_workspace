"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getBotResponse } from "@/lib/chatbotEngine";

interface Message {
    id: string;
    role: "agent" | "user";
    text: string;
}

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            setTimeout(() => {
                const greeting = user
                    ? "Hi, I'm Ryyt. Reviewing your dashboard status..."
                    : "Hi, I'm Ryyt. I'm here to answer questions about our refund infrastructure.";

                setMessages([{ id: "init", role: "agent", text: greeting }]);
            }, 600); // Small delay for realism
        }
    }, [user]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Proactive Nudge (Sales)
    useEffect(() => {
        const nudgeTimeout = setTimeout(() => {
            if (messages.length <= 1 && !isOpen) { // Only if initial greeting is there or nothing
                const nudge = "Did you know Ryyt can automate your entire COD refund flow? I'd love to show you how. 👋";
                setMessages(prev => {
                    // Avoid duplicate nudges
                    if (prev.some(m => m.id === "proactive-nudge")) return prev;
                    return [...prev, { id: "proactive-nudge", role: "agent", text: nudge }];
                });
            }
        }, 10000); // 10 seconds

        return () => clearTimeout(nudgeTimeout);
    }, [isOpen, messages.length]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);

        // Simulated delay for "Thinking"
        setTimeout(async () => {
            try {
                const responseText = await getBotResponse(currentInput, !!user);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "agent",
                    text: responseText
                }]);
            } catch (error) {
                console.error("Chat Error", error);
                setMessages(prev => [...prev, { id: Date.now().toString(), role: "agent", text: "I'm having trouble thinking right now. Please try again." }]);
            } finally {
                setIsTyping(false);
            }
        }, 600);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-24 right-6 w-[360px] md:w-[400px] h-[500px] bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Ryyt Assistant</h3>
                                <p className="text-xs text-blue-400">Online</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white/10 text-gray-200 rounded-bl-none border border-white/5"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 px-4 py-3 rounded-full rounded-bl-none flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100" />
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-black/20">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div className="text-[10px] text-center text-gray-600 mt-2">
                            Ryyt AI can make mistakes. Check important info.
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
