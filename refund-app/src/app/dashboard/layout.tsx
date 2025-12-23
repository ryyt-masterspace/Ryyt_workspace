'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ShieldAlert, LogOut, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from './loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRetry, setShowRetry] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let unsubscribeMerchant: (() => void) | null = null;
        console.log("[DashboardLayout] Initializing Guard...");

        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn("[DashboardLayout] Safety timeout triggered.");
                setShowRetry(true);
            }
        }, 5000);

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("[DashboardLayout] Auth User Found:", user.uid);
                const userRef = doc(db, 'merchants', user.uid);

                unsubscribeMerchant = onSnapshot(userRef, async (userSnap) => {
                    console.log("[DashboardLayout] Merchant Snapshot received. Exists:", userSnap.exists());

                    if (!userSnap.exists()) {
                        console.log("[DashboardLayout] New user detected. Initializing merchant record...");
                        await setDoc(userRef, {
                            email: user.email,
                            brandName: "",
                            logo: "",
                            createdAt: serverTimestamp(),
                            planType: "startup",
                            subscriptionStatus: "pending_payment",
                            lastPaymentDate: serverTimestamp(),
                            settings: { slaDays: 2, paymentMethod: 'UPI' }
                        });
                        setStatus("pending_payment");
                        console.log("[DashboardLayout] Redirecting to /onboarding...");
                        window.location.replace('/onboarding');
                    } else {
                        const userData = userSnap.data();
                        const userStatus = userData?.subscriptionStatus || "active";
                        console.log("[DashboardLayout] Current Subscription Status:", userStatus);
                        setStatus(userStatus);

                        const isLegacyOnboarded = userData?.brandName && userData?.planType;

                        // STRICT REDIRECT: If not active or suspended, they MUST go to onboarding
                        if (userStatus !== "active" && userStatus !== "suspended") {
                            console.log("[DashboardLayout] Unauthorized status detected. Redirecting...");
                            window.location.replace('/onboarding');
                        }
                    }
                    setLoading(false);
                    clearTimeout(timeoutId);
                }, (error) => {
                    console.error("[DashboardLayout] Firestore Snapshot Error:", error);
                    setLoading(false);
                    clearTimeout(timeoutId);
                });

            } else {
                console.log("[DashboardLayout] No Auth User. Redirecting to /login...");
                window.location.replace('/login');
                setLoading(false);
                clearTimeout(timeoutId);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeMerchant) unsubscribeMerchant();
            clearTimeout(timeoutId);
        };
    }, [auth]);

    const handleLogout = async () => {
        await signOut(auth);
        window.location.replace("/login");
    };

    const handleRetry = () => {
        window.location.reload();
    };

    // DEBUG UI for hang investigation
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
                    <button onClick={handleLogout} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border border-white/5">
                        <LogOut size={18} /> Sign Out
                    </button>
                    <p className="mt-6 text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">
                        Ryyt Security Layer v2.5
                    </p>
                </div>
            </div>
        );
    }

    // FINAL GUARD: Render children ONLY if active
    if (status !== "active") {
        console.warn("[DashboardLayout] Blocking render: status is not active (", status, ")");
        return <Loading />;
    }

    return <>{children}</>;
}
