'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

export default function BookDemoModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage logic
        const closedAt = localStorage.getItem('ryyt_demo_modal_closed');
        const submittedAt = localStorage.getItem('ryyt_demo_modal_submitted');
        const now = Date.now();

        if (submittedAt) {
            const daysSinceSubmit = (now - parseInt(submittedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceSubmit < 30) return; // Suppress for 30 days if submitted
        }

        if (closedAt) {
            const daysSinceClose = (now - parseInt(closedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceClose < 3) return; // Suppress for 3 days if closed
        }

        const handleScroll = () => {
            // Trigger after 800px or 35% of page height
            const threshold = Math.max(800, document.documentElement.scrollHeight * 0.35);
            if (window.scrollY > threshold) {
                setIsOpen(true);
                window.removeEventListener('scroll', handleScroll); // Show only once per session until reset
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Also restore if component unmounts
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('ryyt_demo_modal_closed', Date.now().toString());
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
            localStorage.setItem('ryyt_demo_modal_submitted', Date.now().toString());

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
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#0052FF]/10 blur-[60px] pointer-events-none" />

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 text-center relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2">Book a Demo</h2>
                            <p className="text-zinc-400 mb-6">
                                See how we can automate your financial operations.
                                <br />No commitment required.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-medium text-zinc-500 uppercase ml-1">Your Email ID</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@company.com or name@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50 outline-none transition-all placeholder:text-zinc-600"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0052FF] hover:bg-[#0040DD] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Book Free Demo'}
                                </button>
                            </form>

                            <p className="text-[10px] text-zinc-600 mt-4">
                                By booking, you agree to our Terms & Privacy Policy.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
