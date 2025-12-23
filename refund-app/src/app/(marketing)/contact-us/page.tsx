'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ShieldCheck, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await addDoc(collection(db, "inquiries"), {
                ...formData,
                createdAt: serverTimestamp(),
                status: "NEW"
            });
            setIsSuccess(true);
        } catch (err) {
            console.error("Failed to submit inquiry:", err);
            setError("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative min-h-screen pt-40 pb-24 px-6 overflow-hidden bg-black">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0052FF]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Left Column: Grievance & Office Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-12"
                    >
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
                                Contact <span className="text-indigo-500">Ryyt</span>
                            </h1>
                            <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                                Dedicated support for founders and merchants. We take your compliance and inquiries seriously.
                            </p>
                        </div>

                        {/* Grievance Redressal */}
                        <div className="space-y-6">
                            <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                <ShieldCheck className="text-indigo-500" size={24} />
                                Grievance Redressal Mechanism
                            </h3>

                            <div className="grid gap-4">
                                <GrievanceCard
                                    level="Tier 1: General Support"
                                    officer="Support Team"
                                    email="support@ryyt.in"
                                />
                                <GrievanceCard
                                    level="Tier 2: Compliance Officer"
                                    officer="Swatanshu Singh"
                                    email="swatanshu@ryyt.in"
                                />
                                <GrievanceCard
                                    level="Tier 3: Nodal/Grievance Officer"
                                    officer="Shuvam Sarkar"
                                    email="shuvam@ryyt.in"
                                />
                            </div>
                        </div>

                        {/* Office Details */}
                        <div className="space-y-6 pt-6">
                            <div className="flex items-start gap-4">
                                <MapPin className="text-zinc-600 mt-1" size={20} />
                                <div className="text-sm">
                                    <p className="text-white font-medium mb-1">Registered Office</p>
                                    <p className="text-zinc-500 leading-relaxed">
                                        Shantiniketan Apartment, 3 No Basunagar,<br />
                                        Madhyamgram, Kolkata 700129, West Bengal
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone className="text-zinc-600 mt-1" size={20} />
                                <div className="text-sm">
                                    <p className="text-white font-medium mb-1">Direct Line</p>
                                    <p className="text-zinc-500 leading-relaxed">+91 91230 46422</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="bg-zinc-900/50 border border-white/10 p-8 md:p-10 rounded-[32px] backdrop-blur-xl relative overflow-hidden group">
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] group-hover:bg-indigo-500/10 transition-all" />

                            {isSuccess ? (
                                <div className="text-center py-12 space-y-6">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="text-emerald-500" size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Message Received</h3>
                                        <p className="text-zinc-400">Thank you. Your inquiry has been logged. Our team will respond within 3 business days.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsSuccess(false)}
                                        className="text-sm font-bold text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                            placeholder="Jane Doe"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Work Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                            placeholder="jane@company.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                                        >
                                            <option value="General">General Inquiry</option>
                                            <option value="Billing">Billing & Plans</option>
                                            <option value="Grievance">Grievance / Feedback</option>
                                            <option value="Data Privacy">Data Privacy (DPDP)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                                            placeholder="Tell us how we can help..."
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-rose-500 text-sm pl-1">
                                            <AlertCircle size={14} /> {error}
                                        </div>
                                    )}

                                    <button
                                        disabled={isSubmitting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {isSubmitting ? "Processing..." : (
                                            <>
                                                Send Inquiry
                                                <MessageSquare size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function GrievanceCard({ level, officer, email }: { level: string, officer: string, email: string }) {
    return (
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/[0.08] transition-all">
            <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">{level}</p>
            <p className="text-white font-semibold text-sm">{officer}</p>
            <p className="text-zinc-500 text-xs">{email}</p>
        </div>
    );
}
