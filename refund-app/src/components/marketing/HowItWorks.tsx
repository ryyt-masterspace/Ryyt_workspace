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
                <div className="w-full max-w-sm mx-auto px-4">
                    {/* Floating Header */}
                    <div className="flex items-center justify-between mb-6 px-2 opacity-80">
                        <div className="text-sm font-medium text-white/60 uppercase tracking-widest">New Refund</div>
                    </div>

                    {/* Floating Inputs */}
                    <div className="space-y-4">
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <span className="text-sm text-gray-400">Customer</span>
                                <span className="text-sm text-white font-medium">Amit Sharma</span>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <span className="text-sm text-gray-400">Amount</span>
                                <span className="text-sm text-white font-medium">₹2,499.00</span>
                            </div>
                        </div>

                        {/* Floating Button */}
                        <div className="relative mt-6">
                            <div className="absolute -inset-1 bg-blue-500/30 rounded-lg blur-md opacity-50 animate-pulse"></div>
                            <div className="relative w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-3 rounded-lg text-center cursor-pointer transition-colors shadow-xl">
                                Create Entry
                            </div>
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
                <div className="w-full max-w-sm mx-auto px-4 relative">
                    {/* Email Notification Card */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/10 to-transparent rounded-2xl blur-xl"></div>

                        <div className="relative bg-[#111] border border-white/10 rounded-xl p-5 space-y-4">
                            {/* Email Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">R</div>
                                    <div>
                                        <div className="text-sm text-white font-medium">Ryyt Support</div>
                                        <div className="text-[10px] text-gray-500">to me</div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-500">10:23 AM</div>
                            </div>

                            {/* Email Body Text (Filler) */}
                            <div className="space-y-1">
                                <div className="h-1.5 w-3/4 bg-white/10 rounded-full"></div>
                                <div className="h-1.5 w-1/2 bg-white/10 rounded-full"></div>
                            </div>

                            {/* The Link Button */}
                            <div className="group cursor-pointer mt-2">
                                <div className="bg-[#050505] border border-blue-500/30 rounded-lg p-3 flex items-center justify-between group-hover:border-blue-500/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-blue-400/70 uppercase tracking-wider mb-0.5">Secure Link</span>
                                        <span className="text-xs text-blue-400 font-mono">ryyt.io/tr/8821</span>
                                    </div>
                                    <svg className="w-4 h-4 text-blue-500 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "03",
            title: "Update & Resolve",
            description: "Manually update the status as you process the refund. We notify the customer at every step until it&apos;s done.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            visual: (
                <div className="w-full max-w-sm mx-auto px-4">
                    <div className="relative space-y-6">
                        {/* Status Indicator */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">Status</div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                </span>
                                <span className="text-yellow-500 font-medium text-sm">Processing</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full w-2/3 bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </div>

                        {/* Action Toggle */}
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-sm">
                            <span className="text-xs text-gray-500 pl-3">Mark as:</span>
                            <div className="flex items-center gap-1">
                                <div className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-white cursor-pointer transition-colors">Failed</div>
                                <div className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded-full shadow-lg shadow-green-900/20 cursor-pointer hover:bg-green-500 transition-colors">
                                    Paid
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity (New Filler) */}
                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <div className="flex items-center gap-3 opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <div className="text-[10px] text-gray-400">Link sent to customer • 10:23 AM</div>
                            </div>
                            <div className="flex items-center gap-3 opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                <div className="text-[10px] text-gray-400">Viewed by customer • 10:25 AM</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <section id="how-it-works" className="py-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Simple. Manual. <span className="text-blue-500">Transparent.</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        No complex integrations. Just a simple dashboard to manage refunds and keep customers happy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group hover:border-white/10 transition-all duration-500 ${activeStep === index ? 'ring-1 ring-blue-500/20' : ''
                                }`}
                            onClick={() => setActiveStep(index)}
                        >
                            {/* Hover Gradient */}
                            <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent transition-opacity duration-500 ${activeStep === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}></div>

                            {/* Header: Number & Title */}
                            <div className="relative z-10 mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-colors duration-300 ${activeStep === index ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
                                        }`}>
                                        {step.id}
                                    </div>
                                    {activeStep === index && (
                                        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                            <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">Active</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${activeStep === index ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                    }`}>
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Visual Preview */}
                            <div className="relative z-10 mt-auto pt-4">
                                <div className={`transition-all duration-500 transform ${activeStep === index ? 'translate-y-0 opacity-100 grayscale-0' : 'translate-y-2 opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:translate-y-0'
                                    }`}>
                                    {step.visual}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
