"use client";

import { useEffect, useState } from "react";

export default function DemoDashboard() {
    const [step, setStep] = useState(0);
    const [cursorPos, setCursorPos] = useState({ x: "80%", y: "80%" });
    const [isClicking, setIsClicking] = useState(false);
    const [status, setStatus] = useState("Pending Review");
    const [messages, setMessages] = useState([
        { sender: "System", text: "Refund request received for Order #4582." },
    ]);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        const sequence = async () => {
            // Wait a bit before starting
            await wait(1000);

            // Step 1: Move to "Approve" button
            setCursorPos({ x: "72%", y: "65%" }); // Coordinates for Approve button
            await wait(1500);

            // Step 2: Click "Approve"
            setIsClicking(true);
            await wait(200);
            setIsClicking(false);
            setStatus("Approved");
            await wait(500);

            // Step 3: Move to Chat Input
            setCursorPos({ x: "60%", y: "88%" });
            await wait(1500);

            // Step 4: Click Input
            setIsClicking(true);
            await wait(200);
            setIsClicking(false);
            await wait(500);

            // Step 5: Type Message
            const text = "Refund initiated. 2-3 days to settle.";
            for (let i = 0; i <= text.length; i++) {
                setInputValue(text.slice(0, i));
                await wait(50);
            }
            await wait(500);

            // Step 6: Move to Send Button
            setCursorPos({ x: "92%", y: "88%" });
            await wait(800);

            // Step 7: Click Send
            setIsClicking(true);
            await wait(200);
            setIsClicking(false);
            setMessages((prev) => [...prev, { sender: "Agent", text }]);
            setInputValue("");

            // Reset loop after delay
            await wait(3000);
            setStep((s) => s + 1); // Trigger reset if needed or just loop logic
            // Simple reset for demo loop
            setStatus("Pending Review");
            setMessages([{ sender: "System", text: "Refund request received for Order #4582." }]);
            setCursorPos({ x: "80%", y: "80%" });
            sequence();
        };

        sequence();
    }, []);

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    return (
        <div className="w-full max-w-6xl relative z-10 animate-float mx-auto">
            <div className="rounded-[24px] border border-white/10 bg-[#050505] shadow-2xl overflow-hidden relative group">
                {/* Top Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

                {/* Mock UI Container */}
                <div className="relative bg-[#0A0A0A] p-1">
                    <div className="bg-[#0f0f0f] rounded-[20px] overflow-hidden border border-white/5 relative min-h-[500px] flex flex-col">

                        {/* Header */}
                        <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-[#111]">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
                                <div className="text-xs font-medium text-gray-400">Refund #4582</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${status === "Approved"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}>
                                {status}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 p-6 grid grid-cols-12 gap-6">

                            {/* Left Column: Details */}
                            <div className="col-span-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Customer</label>
                                        <div className="h-10 w-full bg-[#1a1a1a] rounded border border-white/5 flex items-center px-3 text-sm text-gray-300">
                                            Aarav Sharma
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Amount</label>
                                        <div className="h-10 w-full bg-[#1a1a1a] rounded border border-white/5 flex items-center px-3 text-sm text-gray-300">
                                            ₹1,299.00
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Reason</label>
                                    <div className="h-24 w-full bg-[#1a1a1a] rounded border border-white/5 p-3 text-sm text-gray-400">
                                        Item size didn't fit. Requested pickup and refund to original source.
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${status === "Approved" ? "bg-green-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}>
                                        {status === "Approved" ? "Approved ✓" : "Approve Refund"}
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10">
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Chat */}
                            <div className="col-span-4 bg-[#161616] rounded-xl border border-white/5 flex flex-col">
                                <div className="p-3 border-b border-white/5 text-xs font-medium text-gray-400">
                                    Communication Log
                                </div>
                                <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[250px]">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.sender === "Agent" ? "justify-end" : "justify-start"}`}>
                                            <div className={`p-3 rounded-xl text-xs max-w-[90%] ${msg.sender === "Agent"
                                                    ? "bg-blue-600/20 text-blue-400 rounded-tr-none border border-blue-500/10"
                                                    : "bg-[#222] text-gray-400 rounded-tl-none border border-white/5"
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-white/5 flex gap-2">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        readOnly
                                        placeholder="Type a message..."
                                        className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                                    />
                                    <button className="p-2 bg-blue-600 rounded-lg text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Fake Cursor */}
                        <div
                            className="absolute pointer-events-none transition-all duration-700 ease-in-out z-50 drop-shadow-2xl"
                            style={{
                                left: cursorPos.x,
                                top: cursorPos.y,
                                transform: isClicking ? "scale(0.9)" : "scale(1)"
                            }}
                        >
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5 28L8.5 6L26.5 18L17.5 20L23.5 29.5L20.5 31.5L14.5 22L10.5 28Z" fill="black" stroke="white" strokeWidth="2" />
                            </svg>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
