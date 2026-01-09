'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

export default function BookDemoPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage on mount
        const lastSeen = localStorage.getItem('ryyt_demo_popup_seen');
        if (lastSeen) {
            const daysSince = (Date.now() - parseInt(lastSeen)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return; // Don't show if seen in last 7 days
        }

        const handleScroll = () => {
            if (window.scrollY > 600) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('ryyt_demo_popup_seen', Date.now().toString());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error('Failed to save lead');

            // Set localStorage to prevent showing again
            localStorage.setItem('ryyt_demo_popup_seen', Date.now().toString());

            // Redirect to Calendly
            window.location.href = `https://calendly.com/shuvam-sarkar?email=${encodeURIComponent(email)}`;
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
                >
                    <div className="relative bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-2xl overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#0052FF]/5 blur-[60px] pointer-events-none" />

                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-1">Not sure where to start?</h3>
                            <p className="text-sm text-zinc-400 mb-4">Book a 15-min personal demo with us.</p>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#0052FF] outline-none transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0052FF] hover:bg-[#0040DD] text-white text-sm font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Book Free Demo'}
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
