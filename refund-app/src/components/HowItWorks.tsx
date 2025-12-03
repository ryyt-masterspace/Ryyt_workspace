"use client";

import { useState, useEffect } from "react";

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);

    // Auto-cycle through steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        {
            id: "01",
            title: "Connect Gateway",
            description: "One-click integration with Razorpay or Cashfree. We sync your refund data instantly.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            visual: (
                <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium text-white">Integrations</div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-[#1A1A1A] p-3 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600/20 rounded flex items-center justify-center text-blue-500 font-bold text-xs">R</div>
                                <span className="text-sm text-gray-300">Razorpay</span>
                            </div>
                            <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] rounded border border-green-500/20">Connected</div>
                        </div>
                        <div className="flex items-center justify-between bg-[#1A1A1A] p-3 rounded-lg border border-white/5 opacity-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-600/20 rounded flex items-center justify-center text-purple-500 font-bold text-xs">C</div>
                                <span className="text-sm text-gray-300">Cashfree</span>
                            </div>
                            <div className="px-2 py-1 bg-white/5 text-gray-500 text-[10px] rounded border border-white/10">Connect</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "02",
            title: "Auto-Track & Notify",
            description: "We detect status changes and send branded email updates to your customers automatically.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            visual: (
                <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">R</div>
                            <div className="flex-1">
                                <div className="h-2 w-20 bg-gray-700 rounded mb-2"></div>
                                <div className="h-2 w-full bg-gray-800 rounded mb-1"></div>
                                <div className="h-2 w-3/4 bg-gray-800 rounded"></div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                                Email Sent
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "03",
            title: "Resolve & Recover",
            description: "Customers get instant proof. If a refund fails, we auto-collect the correct UPI ID.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            visual: (
                <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-auto">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="text-white font-medium mb-1">Refund Complete</div>
                        <div className="text-xs text-gray-500 mb-4">UTR: 3928...2910</div>
                        <div className="flex items-center justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
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
                        From Chaos to Clarity in <span className="text-blue-500">3 Steps</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        We handle the messy part of refunds so you can focus on selling.
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
