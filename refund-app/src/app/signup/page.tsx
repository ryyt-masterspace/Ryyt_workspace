'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setLoading(false);
            setError('Passwords do not match.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Initialize Merchant Document in "pending_payment" state
            const merchantRef = doc(db, 'merchants', user.uid);
            await setDoc(merchantRef, {
                email: user.email,
                brandName: "",
                logo: "",
                gstNumber: "",
                supportEmail: user.email,
                createdAt: serverTimestamp(),
                planType: "startup", // Default placeholder
                subscriptionStatus: "pending_payment",
                lastPaymentDate: null,
                settings: {
                    slaDays: 2,
                    paymentMethod: 'UPI'
                }
            });

            // Initialize Metrics
            const metricsRef = doc(db, 'merchants', user.uid, 'metadata', 'metrics');
            await setDoc(metricsRef, {
                totalSettledAmount: 0,
                activeLiabilityAmount: 0,
                totalRefundsCount: 0,
                stuckAmount: 0,
                failedCount: 0,
                lastUpdated: new Date(),
                status: "INITIALIZED"
            });

            router.push('/dashboard');
        } catch (err: unknown) {
            console.error("Signup Error:", err);
            const error = err as { code?: string };
            if (error.code === 'auth/email-already-in-use') {
                setError('This email is already registered.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
            <Link
                href="/"
                className="absolute top-8 left-8 text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </Link>

            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-48 h-12 mb-4">
                        <Image
                            src="/logo-white.png"
                            alt="Ryyt"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-xl font-semibold text-white">Create your account</h1>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-2">Work Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors pr-12"
                                    placeholder="Min. 8 characters"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors pr-12"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    <ShieldCheck size={18} /> Create Merchant Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
                        <p className="text-zinc-500 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] text-zinc-600 mt-8 uppercase tracking-widest font-bold">
                    Secure Merchant Onboarding v2.5
                </p>
            </div>
        </main>
    );
}
