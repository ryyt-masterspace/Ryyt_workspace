"use client";

import { useEffect, useState, useRef } from "react";

type Screen = "LOGIN" | "DASHBOARD" | "CREATE" | "DETAILS";

export default function DemoDashboard() {
    const [screen, setScreen] = useState<Screen>("LOGIN");
    const [cursorPos, setCursorPos] = useState({ x: "50%", y: "110%" }); // Start off-screen
    const [isClicking, setIsClicking] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [amount, setAmount] = useState("");
    const [utr, setUtr] = useState("");
    const [status, setStatus] = useState("Processing");
    const [showUtrModal, setShowUtrModal] = useState(false);

    // Refs for animation coordination
    const isAnimating = useRef(false);

    useEffect(() => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const runSequence = async () => {
            while (true) {
                // --- RESET STATE ---
                setScreen("LOGIN");
                setEmail("");
                setPassword("");
                setCustomerName("");
                setAmount("");
                setUtr("");
                setStatus("Processing");
                setShowUtrModal(false);
                setCursorPos({ x: "50%", y: "110%" });

                await wait(1000);

                // --- SCENE 1: LOGIN ---
                // Move to Email
                setCursorPos({ x: "50%", y: "42%" });
                await wait(1000);
                await typeText("merchant@ryyt.com", setEmail);

                // Move to Password
                setCursorPos({ x: "50%", y: "55%" });
                await wait(500);
                await typeText("********", setPassword);

                // Click Login
                setCursorPos({ x: "50%", y: "68%" });
                await wait(800);
                await click();

                // Transition
                await wait(500);
                setScreen("DASHBOARD");

                // --- SCENE 2: DASHBOARD OVERVIEW ---
                // Move cursor around to show "looking"
                setCursorPos({ x: "20%", y: "30%" }); // Stats
                await wait(800);
                setCursorPos({ x: "70%", y: "40%" }); // Recent refunds
                await wait(800);

                // Click "New Refund"
                setCursorPos({ x: "88%", y: "15%" }); // Top right button
                await wait(1000);
                await click();

                // Transition
                setScreen("CREATE");

                // --- SCENE 3: CREATE REFUND ---
                // Type Customer Name
                setCursorPos({ x: "30%", y: "35%" });
                await wait(800);
                await typeText("Ananya Gupta", setCustomerName);

                // Type Amount
                setCursorPos({ x: "70%", y: "35%" });
                await wait(500);
                await typeText("4500", setAmount);

                // Click Create
                setCursorPos({ x: "85%", y: "85%" }); // Bottom right action
                await wait(1000);
                await click();

                // Transition
                setScreen("DETAILS");

                // --- SCENE 4: TRACKING & UPDATE ---
                // Move to Update Status
                setCursorPos({ x: "85%", y: "20%" });
                await wait(1500);
                await click();
                setShowUtrModal(true);

                // Enter UTR
                setCursorPos({ x: "50%", y: "50%" });
                await wait(800);
                await click();
                await typeText("HDFC00088219", setUtr);

                // Confirm
                setCursorPos({ x: "50%", y: "70%" });
                await wait(800);
                await click();

                setShowUtrModal(false);
                setStatus("Completed");

                // Admire the result
                setCursorPos({ x: "90%", y: "90%" });
                await wait(3000);
            }
        };

        runSequence();
    }, []);

    // --- HELPER FUNCTIONS ---
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const click = async () => {
        setIsClicking(true);
        await wait(150);
        setIsClicking(false);
    };

    const typeText = async (text: string, setter: (s: string) => void) => {
        for (let i = 1; i <= text.length; i++) {
            setter(text.slice(0, i));
            await wait(Math.random() * 30 + 30); // Random typing speed
        }
    };

    return (
        <div className="w-full max-w-5xl relative z-10 animate-float mx-auto">
            <div className="rounded-[24px] border border-white/10 bg-[#050505] shadow-2xl overflow-hidden relative group">
                {/* Top Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

                {/* Mock UI Container */}
                <div className="relative bg-[#0A0A0A] p-1 h-[600px] select-none">
                    <div className="bg-[#0f0f0f] rounded-[20px] overflow-hidden border border-white/5 h-full flex flex-col relative">

                        {/* --- SCREEN: LOGIN --- */}
                        {screen === "LOGIN" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] z-10 transition-opacity duration-500">
                                <div className="w-[320px] space-y-6">
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl mx-auto flex items-center justify-center border border-blue-500/20">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Welcome Back</h3>
                                        <p className="text-xs text-gray-500">Enter your credentials to access the dashboard.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Email</label>
                                            <div className="h-10 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center px-3 text-sm text-white">
                                                {email}<span className="animate-pulse">|</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Password</label>
                                            <div className="h-10 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center px-3 text-sm text-white">
                                                {password ? "•".repeat(password.length) : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full h-10 bg-blue-600 rounded-lg text-white text-sm font-medium shadow-lg shadow-blue-900/20">
                                        Sign In
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- SCREEN: DASHBOARD --- */}
                        {screen === "DASHBOARD" && (
                            <div className="absolute inset-0 bg-[#0f0f0f] z-10 transition-opacity duration-500 flex flex-col">
                                {/* Nav */}
                                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#111]">
                                    <div className="font-bold text-white tracking-tight">RYYT <span className="text-blue-500">.</span></div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-gray-400">Overview</div>
                                        <div className="text-xs text-white font-medium">Refunds</div>
                                        <button className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-md">
                                            + New Refund
                                        </button>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: "Total Refunds", val: "₹1,24,500", color: "text-white" },
                                            { label: "Processing", val: "12", color: "text-yellow-400" },
                                            { label: "Completed", val: "148", color: "text-green-400" }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-[#161616] border border-white/5 p-4 rounded-xl space-y-1">
                                                <div className="text-[10px] uppercase text-gray-500 font-medium">{stat.label}</div>
                                                <div className={`text-xl font-mono font-medium ${stat.color}`}>{stat.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden flex-1">
                                        <div className="px-4 py-3 border-b border-white/5 text-xs font-medium text-gray-400">Recent Activity</div>
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5"></div>
                                                    <div>
                                                        <div className="text-xs text-white font-medium">Order #{4920 - i}</div>
                                                        <div className="text-[10px] text-gray-500">Just now</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400">₹{1200 + i * 500}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SCREEN: CREATE --- */}
                        {screen === "CREATE" && (
                            <div className="absolute inset-0 bg-[#0f0f0f] z-10 transition-all duration-300 flex flex-col">
                                <div className="h-14 border-b border-white/5 flex items-center px-6 bg-[#111]">
                                    <div className="text-sm font-medium text-white">Create Manual Refund</div>
                                </div>
                                <div className="p-8 space-y-6 max-w-lg mx-auto w-full mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-gray-500">Customer Name</label>
                                            <div className="h-10 bg-[#161616] border border-white/10 rounded-lg flex items-center px-3 text-sm text-white">
                                                {customerName}<span className="animate-pulse">|</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-gray-500">Amount (₹)</label>
                                            <div className="h-10 bg-[#161616] border border-white/10 rounded-lg flex items-center px-3 text-sm text-white">
                                                {amount}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-24 bg-[#161616] border border-white/10 rounded-lg p-3 text-sm text-gray-500">
                                        Reason for refund...
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                                            Create Refund
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SCREEN: DETAILS (TRACKING) --- */}
                        {screen === "DETAILS" && (
                            <div className="absolute inset-0 bg-[#0f0f0f] z-10 transition-opacity duration-500 flex flex-col">
                                <div className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#111]">
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-medium text-gray-400">Refund #RF-9921</div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${status === "Completed"
                                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                            }`}>
                                            {status}
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 border border-white/10 transition-colors">
                                        Update Status
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-white">{customerName || "Ananya Gupta"}</div>
                                            <div className="text-sm text-gray-500">via UPI • {amount ? `₹${amount}` : "₹4,500"}</div>
                                        </div>
                                    </div>

                                    {/* Timeline / Status Box */}
                                    <div className={`p-6 rounded-xl border transition-all duration-500 ${status === "Completed"
                                        ? "bg-green-900/10 border-green-500/30"
                                        : "bg-[#161616] border-white/5 border-dashed"
                                        }`}>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                                            {status === "Completed" ? "Transaction Reference (UTR)" : "Current Status"}
                                        </label>

                                        {status === "Completed" ? (
                                            <div className="space-y-2 animate-in slide-in-from-bottom-2">
                                                <div className="text-2xl font-mono text-green-400 tracking-wide">{utr}</div>
                                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    Verified & Notified
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-yellow-500/80">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-mono">Processing with Bank...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal */}
                                {showUtrModal && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity duration-200">
                                        <div className="w-[350px] bg-[#111] border border-white/10 rounded-xl p-6 shadow-2xl">
                                            <h3 className="text-white font-medium mb-4">Complete Refund</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs text-gray-400 block mb-1">UTR / Reference Number</label>
                                                    <div className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono flex items-center h-10">
                                                        {utr}<span className="animate-pulse">|</span>
                                                    </div>
                                                </div>
                                                <button className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium mt-2">
                                                    Confirm & Notify
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fake Cursor */}
                        <div
                            className="absolute pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] z-50 drop-shadow-2xl"
                            style={{
                                left: cursorPos.x,
                                top: cursorPos.y,
                                transform: isClicking ? "scale(0.8)" : "scale(1)"
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5 28L8.5 6L26.5 18L17.5 20L23.5 29.5L20.5 31.5L14.5 22L10.5 28Z" fill="black" stroke="white" strokeWidth="2" />
                            </svg>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
