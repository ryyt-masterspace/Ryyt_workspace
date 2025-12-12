'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LeadCaptureModal({ isOpen, onClose }: LeadModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Save to Firestore
            await addDoc(collection(db, 'leads'), {
                ...formData,
                createdAt: serverTimestamp(),
                source: 'Landing Page'
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setFormData({ name: '', email: '', phone: '', company: '', role: '' });
            }, 3000);
        } catch (error) {
            console.error("Error saving lead:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-20 bg-[#0052FF]/20 blur-[50px] pointer-events-none" />

                        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            {success ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Request Received!</h3>
                                    <p className="text-zinc-400">Our team will contact you shortly to set up your Financial Control Tower.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Get Early Access</h2>
                                        <p className="text-sm text-zinc-400">
                                            Ryyt is currently invite-only. Fill out your details to skip the waitlist.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-zinc-500 uppercase">Full Name</label>
                                                <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-[#0052FF] outline-none transition-colors" placeholder="John Doe" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-zinc-500 uppercase">Role</label>
                                                <input required name="role" value={formData.role} onChange={handleChange} className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-[#0052FF] outline-none transition-colors" placeholder="Founder / Ops Head" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-500 uppercase">Work Email</label>
                                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-[#0052FF] outline-none transition-colors" placeholder="you@company.com" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-zinc-500 uppercase">Company Name</label>
                                                <input required name="company" value={formData.company} onChange={handleChange} className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-[#0052FF] outline-none transition-colors" placeholder="Acme Inc." />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-zinc-500 uppercase">Phone</label>
                                                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-[#0052FF] outline-none transition-colors" placeholder="+91 98765..." />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full mt-4 bg-[#0052FF] hover:bg-[#0040DD] text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Request Access'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
