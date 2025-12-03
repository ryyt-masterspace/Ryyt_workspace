"use client";

import { useState, useEffect } from "react";

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);

    // Auto-cycle through steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        {
            id: "01",
            title: "Create Refund Entry",
            description: "Log in to your dashboard and manually enter the refund details. No coding or gateway integration required.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            visual: (
                <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium text-white">New Refund</div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="bg-[#1A1A1A] p-2 rounded border border-white/5">
                            <div className="text-[10px] text-gray-500 mb-1">Customer Name</div>
                            <div className="text-xs text-gray-300">Amit Sharma</div>
                        </div>
                        <div className="bg-[#1A1A1A] p-2 rounded border border-white/5">
                            <div className="text-[10px] text-gray-500 mb-1">Amount</div>
                            <div className="text-xs text-gray-300">₹2,499.00</div>
                        </div>
                        <div className="w-full bg-blue-600/20 border border-blue-600/50 text-blue-400 text-xs font-medium py-2 rounded text-center">
                            Create Entry
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "02",
            title: "Customer Gets Link",
            description: "We instantly generate a branded tracking page and email it to your customer. They can add their UPI ID securely.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            ),
            visual: (
                <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-auto relative overflow-hidden">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">R</div>
                            <div>
                                <div className="text-xs text-white font-medium">Refund Started</div>
                                <div className="text-[10px] text-gray-500">Track your request</div>
                            </div>
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-center">
                            <div className="text-[10px] text-blue-300 mb-2">Secure Tracking Link</div>
                            <div className="text-xs text-blue-400 font-mono bg-black/20 py-1 rounded">ryyt.io/tr/8821</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "03",
            title: "Update & Resolve",
            description: "Manually update the status as you process the refund. We notify the customer at every step until it's done.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            visual: (
                <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-auto">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">Current Status</div>
                            <div className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] rounded border border-yellow-500/20">Processing</div>
                        </div>
                        <div className="h-0.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-blue-500"></div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <div className="text-[10px] text-gray-500">Action</div>
                            <div className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-medium rounded cursor-pointer transition-colors">
                                Mark Paid
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <section className="py-24 px-6 relative z-10 bg-[#050505]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Simple. Manual. <span className="text-blue-500">Transparent.</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        No complex integrations. Just a simple dashboard to manage refunds and keep customers happy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-blue-500/20 to-blue-500/20 -z-10"></div>

                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`relative flex flex-col items-center cursor-pointer group transition-all duration-500 ${activeStep === index ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-80'
                                }`}
                            onClick={() => setActiveStep(index)}
                        >
                            {/* Step Number Bubble */}
                            <div className={`w-24 h-24 rounded-full bg-[#0A0A0A] border-4 flex items-center justify-center mb-6 z-10 transition-colors duration-500 ${activeStep === index ? 'border-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-[#222] text-gray-600'
                                }`}>
                                <span className="text-2xl font-bold">{step.id}</span>
                            </div>

                            {/* Content */}
                            <div className="text-center mb-8 px-4">
                                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${activeStep === index ? 'text-white' : 'text-gray-500'
                                    }`}>
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Visual Preview */}
                            <div className={`w-full transition-all duration-500 transform ${activeStep === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-50 grayscale'
                                }`}>
                                {step.visual}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
