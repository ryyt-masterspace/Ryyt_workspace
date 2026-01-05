'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import {
    Check,
    ChevronRight,
    Store,
    Mail,
    Hash,
    Zap,
    Rocket,
    Shield,
    Loader2,
    CreditCard,
    ArrowLeft,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { PLANS, PlanType } from '@/config/plans';
import { calculateFinalBill } from '@/lib/taxCalculator';

export default function OnboardingWizard() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        brandName: '',
        supportEmail: '',
        gstNumber: '',
        planType: 'startup' as PlanType
    });

    // Payment State
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'connecting' | 'sandbox'>('idle');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
            if (!currUser) {
                router.push('/login');
                return;
            }
            setUser(currUser);

            // Load existing data if any
            const docRef = doc(db, 'merchants', currUser.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setFormData({
                    brandName: data.brandName || '',
                    supportEmail: data.supportEmail || currUser.email || '',
                    gstNumber: data.gstNumber || '',
                    planType: (data.planType as PlanType) || 'startup'
                });

                // If they are already active, send them away
                if (data.subscriptionStatus === 'active') {
                    router.push('/dashboard');
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        if (!user) return;
        try {
            await updateDoc(doc(db, 'merchants', user.uid), {
                brandName: formData.brandName,
                supportEmail: formData.supportEmail,
                gstNumber: formData.gstNumber
            });
            setStep(2);
        } catch (error) {
            console.error("Step 1 Save Error:", error);
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const handlePlanSelect = async (type: PlanType) => {
        if (!user) return;
        setFormData(prev => ({ ...prev, planType: type }));
        try {
            await updateDoc(doc(db, 'merchants', user.uid), {
                planType: type
            });
        } catch (error) {
            console.error("Plan Save Error:", error);
        }
    };

    const handleProceedToPayment = async () => {
        if (!user) return;
        setPaymentStatus('connecting');

        try {
            // 1. Load Razorpay Script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            await new Promise((resolve) => {
                script.onload = resolve;
            });

            // 2. Create Subscription via Backend
            const response = await fetch(`/api/razorpay/create-subscription?v=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planType: formData.planType,
                    userId: user.uid
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // 3. Open Razorpay (Strict Mode)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: any = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                subscription_id: data.subscriptionId,
                name: "RYYT (Calcure Technologies)",
                description: `${formData.planType.toUpperCase()} Plan Subscription`,
                image: "/logo-white.png",
                prefill: {
                    name: formData.brandName,
                    email: formData.supportEmail,
                },
                theme: { color: "#4F46E5" },
                modal: {
                    ondismiss: function () {
                        console.log("Payment cancelled.");
                        setPaymentStatus('idle');
                    }
                },
                handler: function (response: { razorpay_payment_id: string; razorpay_subscription_id?: string; razorpay_signature: string }) {
                    setPaymentStatus('idle');
                    setSaving(true);

                    // Polling
                    let attempts = 0;
                    const maxAttempts = 30;
                    const pollInterval = setInterval(async () => {
                        attempts++;
                        try {
                            const merchantSnap = await getDoc(doc(db, 'merchants', user.uid));
                            const status = merchantSnap.data()?.subscriptionStatus;

                            if (status === 'active') {
                                clearInterval(pollInterval);
                                setSaving(false);
                                alert("Payment Verified! Redirecting to Dashboard...");
                                router.push('/dashboard');
                            } else if (attempts >= maxAttempts) {
                                clearInterval(pollInterval);
                                setSaving(false);
                                alert("Payment verification timed out. If money was deducted, it will be refunded. Please contact support.");
                            }
                        } catch (err) { console.error("Polling Error:", err); }
                    }, 1000);
                }
            };

            // STRICTLY REMOVE CONFLICTING KEYS
            if (data.subscriptionId) {
                delete options.amount;
                delete options.currency;
                delete options.order_id;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rzp = new (window as unknown as { Razorpay: new (o: any) => { open: () => void } }).Razorpay(options);
            rzp.open();

        } catch (error: unknown) {
            console.error("Checkout Error:", error);
            const msg = (error as Error).message || "An unexpected error occurred.";
            alert(`Payment Initialization Failed: ${msg}`);
            setPaymentStatus('idle');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white py-12 px-4 md:py-24">
            <div className="max-w-4xl mx-auto">

                {/* 1. PROGRESS HEADER */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative w-32 h-8 mb-8 opacity-50">
                        <Image src="/logo-white.png" alt="Ryyt" fill className="object-contain" />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-indigo-400' : 'text-zinc-600'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${step >= 1 ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800'}`}>1</div>
                            <span className="text-[10px] uppercase tracking-widest font-bold">Store Profile</span>
                        </div>
                        <div className="w-12 h-px bg-zinc-800" />
                        <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-indigo-400' : 'text-zinc-600'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${step >= 2 ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800'}`}>2</div>
                            <span className="text-[10px] uppercase tracking-widest font-bold">Select Plan</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: BUSINESS PROFILE */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 md:p-12"
                        >
                            <div className="mb-10 text-center">
                                <h1 className="text-3xl font-bold mb-2">Tell us about your brand</h1>
                                <p className="text-zinc-500">Configure your public-facing store details.</p>
                            </div>

                            <form onSubmit={handleStep1Submit} className="max-w-md mx-auto space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                        <Store size={14} /> Brand Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Acme Clothing"
                                        value={formData.brandName}
                                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                        <Mail size={14} /> Support Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="support@brand.com"
                                        value={formData.supportEmail}
                                        onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                        <Hash size={14} /> GST Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="29AAAAA0000A1Z5"
                                        value={formData.gstNumber}
                                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700 font-mono"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                                >
                                    {saving ? <><Loader2 className="animate-spin" /> Saving Profile...</> : <>Next: Choose Plan <ChevronRight size={18} /></>}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 2: PLAN SELECTION */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-3xl font-bold mb-2">Choose your growth engine</h1>
                                <p className="text-zinc-500">Select a plan to activate your account features.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                {(['startup', 'growth', 'scale'] as PlanType[]).map((pType) => {
                                    const plan = PLANS[pType];
                                    const isActive = formData.planType === pType;
                                    const Icon = pType === 'startup' ? Zap : pType === 'growth' ? Rocket : Shield;

                                    return (
                                        <div
                                            key={pType}
                                            onClick={() => handlePlanSelect(pType)}
                                            className={`cursor-pointer group relative rounded-3xl p-6 border transition-all duration-300 ${isActive
                                                ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                                                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute top-4 right-4 bg-indigo-500 rounded-full p-1">
                                                    <Check size={12} className="text-black stroke-[4px]" />
                                                </div>
                                            )}

                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border transition-colors ${isActive ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-white/5 border-white/5'
                                                }`}>
                                                <Icon size={24} className={isActive ? 'text-indigo-400' : 'text-zinc-500'} />
                                            </div>

                                            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                            <div className="flex flex-col mb-4">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-mono">₹{plan.price.toLocaleString()}</span>
                                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">/ mo</span>
                                                </div>
                                                <p className="text-[10px] text-blue-400 font-bold">+ ₹{plan.setupFee.toLocaleString()} Setup Fee</p>
                                            </div>

                                            <div className="space-y-3 pt-6 border-t border-white/5">
                                                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                                                    <span className="text-white font-bold">{plan.limit.toLocaleString()}</span> monthly refunds included.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* SUMMARY & PROCEED */}
                            <div className="max-w-md mx-auto bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <ShieldCheck size={80} />
                                </div>

                                <div className="relative z-10">
                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-4">Checkout Summary</p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-400">Merchant</span>
                                            <span className="font-bold">{formData.brandName || 'Untitled Store'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-400">Selected Plan</span>
                                            <span className="font-bold uppercase text-indigo-400">{PLANS[formData.planType].name}</span>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase">Due Today (Inc. GST)</p>
                                                <p className="text-3xl font-mono font-bold">₹{calculateFinalBill(PLANS[formData.planType].price).total.toLocaleString()}</p>
                                                <p className="text-[10px] text-blue-400 mt-1">+ ₹{PLANS[formData.planType].setupFee.toLocaleString()} one-time setup fee</p>
                                            </div>
                                            <Lock size={16} className="text-green-500/50 mb-1" />
                                        </div>
                                    </div>

                                    <div className="mb-6 px-4">
                                        <p className="text-[10px] text-zinc-500 italic leading-relaxed text-center">
                                            Note: The bank mandate shows a maximum limit to allow for your base plan + any usage overages. You will only be charged for your actual usage and will receive an invoice for every transaction.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleProceedToPayment}
                                        disabled={paymentStatus === 'connecting' || saving}
                                        className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {paymentStatus === 'connecting' ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Connecting to Razorpay...
                                            </>
                                        ) : saving ? (
                                            <>
                                                <Loader2 className="animate-spin text-indigo-600" size={18} />
                                                Verifying Payment...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={18} /> Proceed to Secure Payment
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[10px] text-center text-zinc-500 mt-6 flex items-center justify-center gap-2">
                                        <Lock size={10} /> 256-bit Bank Grade Security
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="mt-8 flex items-center gap-2 text-zinc-500 hover:text-white mx-auto text-xs font-bold transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to Store Profile
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}
