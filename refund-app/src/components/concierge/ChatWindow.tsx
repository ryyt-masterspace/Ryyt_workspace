"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getBotResponse } from "@/lib/chatbotEngine";
import { SCENARIO_MAP } from "@/config/chatbotData";

interface ActionButton {
    label: string;
    nextId: string;
}

interface Message {
    id: string;
    role: "agent" | "user";
    text: string;
    actions?: ActionButton[];
}

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasCapturedLead, setHasCapturedLead] = useState(false);
    const [lastInterest, setLastInterest] = useState("General");
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Greeting (Load 'root' scenario)
    useEffect(() => {
        if (messages.length === 0) {
            const timer = setTimeout(() => {
                const root = SCENARIO_MAP["root"];
                setMessages([{
                    id: "init",
                    role: "agent",
                    text: root.message,
                    actions: root.options
                }]);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [messages.length]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Proactive Nudge
    useEffect(() => {
        const nudgeTimeout = setTimeout(() => {
            if (messages.length <= 1 && !isOpen) {
                const nudge = "Did you know Ryyt can automate your entire COD refund flow? I'd love to show you how. 👋";
                setMessages(prev => {
                    if (prev.some(m => m.id === "proactive-nudge")) return prev;
                    return [...prev, { id: "proactive-nudge", role: "agent", text: nudge }];
                });
            }
        }, 15000);

        return () => clearTimeout(nudgeTimeout);
    }, [isOpen, messages.length]);

    const handleActionClick = (label: string, nextId: string) => {
        setLastInterest(label);

        // Show user selection
        const userMsg: Message = { id: Date.now().toString(), role: "user", text: label };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        setTimeout(async () => {
            try {
                const response = await getBotResponse(label, !!user, label, nextId);

                if (response.captureLead) {
                    setHasCapturedLead(true);
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "agent",
                    text: response.text,
                    actions: response.actions
                }]);
            } catch (error) {
                console.error("Chat Error", error);
            } finally {
                setIsTyping(false);
            }
        }, 600);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);

        setTimeout(async () => {
            try {
                const response = await getBotResponse(currentInput, !!user, lastInterest);

                if (response.captureLead) {
                    setHasCapturedLead(true);
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "agent",
                    text: response.text,
                    actions: response.actions
                }]);
            } catch (error) {
                console.error("Chat Error", error);
            } finally {
                setIsTyping(false);
            }
        }, 600);
    };

    const resetChat = () => {
        setHasCapturedLead(false);
        setMessages([]); // Clear history
        // The useEffect will pick up messages.length === 0 and trigger the initial greeting
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-24 right-6 w-[360px] md:w-[400px] h-[550px] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Ryyt</h3>
                                <p className="text-[10px] text-indigo-300 font-medium">Created by Shuvam</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <span className="sr-only">Close</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-6 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-white/10 text-gray-100 rounded-bl-none border border-white/5"
                                        }`}
                                >
                                    {msg.text}
                                    {/* Action Buttons */}
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            {msg.actions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleActionClick(action.label, action.nextId)}
                                                    className={`text-left text-xs px-4 py-3 rounded-xl transition-all border ${action.label === "Return to Main Menu"
                                                        ? "bg-white/5 hover:bg-white/10 text-gray-400 border-white/5 hover:border-white/10"
                                                        : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/20 hover:border-indigo-500/40"
                                                        }`}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
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

                    {/* Input Area or Guided Exit */}
                    <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                        {hasCapturedLead ? (
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <button
                                    onClick={onClose}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 text-sm"
                                >
                                    All set
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={resetChat}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 p-3 rounded-xl transition-colors text-sm border border-white/5 font-medium"
                                    >
                                        Main Menu
                                    </button>
                                    <button
                                        onClick={() => handleActionClick("I'm ready to book a demo.", "story_contact")}
                                        className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 p-3 rounded-xl transition-colors text-sm border border-indigo-500/20 font-medium"
                                    >
                                        Book Demo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type a message..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-5 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-0 disabled:scale-75 transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                                <div className="text-[10px] text-center text-gray-600 mt-3 font-medium tracking-wide">
                                    Ryyt AI can make mistakes. Check important info.
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
