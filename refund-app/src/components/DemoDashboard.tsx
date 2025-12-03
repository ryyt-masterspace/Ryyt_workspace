"use client";

import { useEffect, useState } from "react";

export default function DemoDashboard() {
    const [step, setStep] = useState(0);
    const [cursorPos, setCursorPos] = useState({ x: "90%", y: "90%" });
    const [isClicking, setIsClicking] = useState(false);
    const [status, setStatus] = useState("Processing");
    const [showModal, setShowModal] = useState(false);
    const [utrValue, setUtrValue] = useState("");
    const [noteValue, setNoteValue] = useState("");
    const [finalState, setFinalState] = useState(false);

    useEffect(() => {
        const sequence = async () => {
            // Reset state for loop
            await wait(1000);
            setStatus("Processing");
            setShowModal(false);
            setUtrValue("");
            setNoteValue("");
            setFinalState(false);
            setCursorPos({ x: "80%", y: "80%" });

            // Step 1: Move to "Update Status" button
            await wait(1000);
            setCursorPos({ x: "85%", y: "35%" }); // Approx location of top-right action
            await wait(1500);

            // Step 2: Click "Update Status"
            setIsClicking(true);
            await wait(200);
            setIsClicking(false);
            setShowModal(true);
            await wait(500);

            // Step 3: Move to UTR Input
            setCursorPos({ x: "50%", y: "45%" }); // Center modal input
            await wait(1000);

            // Step 4: Click Input
            setIsClicking(true);
            await wait(200);
            setIsClicking(false);

            // Step 5: Type UTR
            const utr = "HDFC0004582910";
            for (let i = 0; i <= utr.length; i++) {
                setUtrValue(utr.slice(0, i));
                await wait(50);
            }
            await wait(500);

            // Step 6: Move to Note Input
            setCursorPos({ x: "50%", y: "58%" });
            await wait(800);
            setIsClicking(true);
            await wait(200);
            setIsClicking(false);

            // Step 7: Type Note
            const note = "Refund processed via NEFT.";
            for (let i = 0; i <= note.length; i++) {
                setNoteValue(note.slice(0, i));
                await wait(30);
            }
            await wait(500);

            // Step 8: Move to "Complete Refund" button
            setCursorPos({ x: "50%", y: "70%" });
            await wait(800);

            // Step 9: Click Complete
            setIsClicking(true);
            await wait(200);
            setIsClicking(false);
            setShowModal(false);
            setStatus("Completed");
            setFinalState(true);

            // Wait before looping
            await wait(4000);
            sequence();
        };

        sequence();
    }, []);

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    return (
        <div className="w-full max-w-5xl relative z-10 animate-float mx-auto">
            <div className="rounded-[24px] border border-white/10 bg-[#050505] shadow-2xl overflow-hidden relative group">
                {/* Top Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

                {/* Mock UI Container */}
                <div className="relative bg-[#0A0A0A] p-1 min-h-[450px]">
                    <div className="bg-[#0f0f0f] rounded-[20px] overflow-hidden border border-white/5 h-full flex flex-col">

                        {/* Header */}
                        <div className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#111]">
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-gray-400">Refund #RF-2024-892</div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${status === "Completed"
                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    }`}>
                                    {status}
                                </div>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 border border-white/10 transition-colors">
                                Update Status
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 grid grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Customer Details</label>
                                    <div className="text-lg text-white font-medium">Vikram Singh</div>
                                    <div className="text-sm text-gray-400">vikram.s@example.com</div>
                                    <div className="text-sm text-gray-400">+91 98765 43210</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Order Info</label>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <span>Order #4582</span>
                                        <span className="text-gray-600">•</span>
                                        <span>₹2,499.00</span>
                                        <span className="text-gray-600">•</span>
                                        <span>UPI</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* The "Hero UTR" Section */}
                                <div className={`p-6 rounded-xl border transition-all duration-500 ${finalState
                                        ? "bg-green-900/10 border-green-500/30"
                                        : "bg-[#161616] border-white/5 border-dashed"
                                    }`}>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                                        {finalState ? "Transaction Reference (UTR)" : "Refund Details"}
                                    </label>

                                    {finalState ? (
                                        <div className="space-y-2">
                                            <div className="text-2xl font-mono text-green-400 tracking-wide">{utrValue}</div>
                                            <div className="text-sm text-gray-400 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                Verified & Notified
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic">
                                            Pending completion. Update status to generate reference.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Overlay */}
                        {showModal && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                                <div className="w-[400px] bg-[#111] border border-white/10 rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                                    <h3 className="text-white font-medium mb-4">Complete Refund</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">UTR / Reference Number</label>
                                            <input
                                                type="text"
                                                value={utrValue}
                                                readOnly
                                                className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                                                placeholder="Enter UTR..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Internal Note</label>
                                            <input
                                                type="text"
                                                value={noteValue}
                                                readOnly
                                                className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                placeholder="Add a note..."
                                            />
                                        </div>
                                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium mt-2">
                                            Mark as Completed
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
