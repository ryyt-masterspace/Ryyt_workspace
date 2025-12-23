'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ShieldAlert, LogOut, Loader2, Lock } from 'lucide-react';
import { useRouter, redirect } from 'next/navigation';
import Loading from './loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const auth = getAuth(app);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRetry, setShowRetry] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let unsubscribeMerchant: (() => void) | null = null;

        // Task 4: Safety Timeout (Show retry link after 5 seconds)
        const timeoutId = setTimeout(() => {
            if (loading) setShowRetry(true);
        }, 5000);

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, 'merchants', user.uid);

                // Start real-time listener for Merchant data
                unsubscribeMerchant = onSnapshot(userRef, async (userSnap) => {
                    if (!userSnap.exists()) {
                        // Initialize new user
                        await setDoc(userRef, {
                            email: user.email,
                            brandName: "",
                            logo: "",
                            createdAt: serverTimestamp(),
                            planType: "startup",
                            subscriptionStatus: "pending_payment",
                            lastPaymentDate: serverTimestamp(),
                            settings: {
                                slaDays: 2,
                                paymentMethod: 'UPI'
                            }
                        });
                        setStatus("pending_payment");
                        // Task 2: Instant Redirect
                        window.location.href = '/onboarding';
                    } else {
                        const userData = userSnap.data();
                        const userStatus = userData?.subscriptionStatus || "active";
                        setStatus(userStatus);

                        const isLegacyOnboarded = userData?.brandName && userData?.planType;
                        if (userStatus === "pending_payment" && !isLegacyOnboarded) {
                            // Task 2: Instant Redirect
                            window.location.href = '/onboarding';
                        }
                    }
                    setLoading(false);
                    clearTimeout(timeoutId);
                }, (error) => {
                    console.error("Layout onSnapshot Error:", error);
                    setLoading(false);
                    clearTimeout(timeoutId);
                });

            } else {
                window.location.href = '/login';
                setLoading(false);
                clearTimeout(timeoutId);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeMerchant) unsubscribeMerchant();
            clearTimeout(timeoutId);
        };
    }, [auth, router]);

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = "/login";
    };

    const handleRetry = () => {
        window.location.reload();
    };

    // 4. THE IRON-CLAD GATEKEEPER
    // 4a. Still Loading
    if (loading) {
        return (
            <div className="relative min-h-screen">
                <Loading />
                {showRetry && (
                    <div className="fixed bottom-12 left-0 right-0 flex justify-center z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="bg-[#0A0A0A] border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
                            <p className="text-xs text-gray-400">Session taking too long?</p>
                            <button
                                onClick={handleRetry}
                                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <Lock size={12} /> Click here to retry
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 4b. Explicit Suspension
    if (status === "suspended") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white">
                <div className="max-w-md w-full bg-[#0A0A0A] border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl shadow-red-500/5">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Suspended</h1>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                        Your subscription has expired or your access has been manually suspended by the administration.
                    </p>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-left mb-8">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Instructions</p>
                        <p className="text-sm text-gray-300">
                            Please complete your pending overage or subscription payment via UPI/Bank transfer and notify your account manager to restore access.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border border-white/5"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>

                    <p className="mt-6 text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">
                        Ryyt Security Layer v2.5
                    </p>
                </div>
            </div>
        );
    }

    // 4c. Not Active (Wait for Redirect or continue Loading)
    if (status !== "active") {
        return <Loading />;
    }

    // 4d. Iron-Clad: Render children ONLY if status === "active"
    return <>{children}</>;
}
