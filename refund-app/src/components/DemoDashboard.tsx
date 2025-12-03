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
        <button className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-md">
            + New Refund
        </button>
                                    </div >
                                </div >
        {/* Content */ }
        < div className = "p-6 space-y-6" >
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
        left: cursorPos.x,
        top: cursorPos.y,
        transform: isClicking ? "scale(0.8)" : "scale(1)"
    }}
>
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 28L8.5 6L26.5 18L17.5 20L23.5 29.5L20.5 31.5L14.5 22L10.5 28Z" fill="black" stroke="white" strokeWidth="2" />
    </svg>
</div>

                    </div >
                </div >
            </div >
        </div >
    );
}
