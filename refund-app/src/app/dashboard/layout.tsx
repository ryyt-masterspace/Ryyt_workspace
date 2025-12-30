'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ShieldAlert, LogOut, Loader2, Lock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { PLANS } from '@/config/plans';
import Script from 'next/script';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRetry, setShowRetry] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
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

                        // STRICT REDIRECT: If not active or suspended or cancelled, they MUST go to onboarding
                        // We allow 'suspended', 'cancelled', 'expired' to stay here to see their respective screens
                        const allowedStatuses = ["active", "suspended", "cancelled", "expired", "halted"];
                        if (!allowedStatuses.includes(userStatus)) {
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
    }, [router, loading]);

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

    if (status === "cancelled" || status === "expired" || status === "halted") {
        if (isVerifying) {
            return (
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white text-center">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
                    <p className="text-gray-400">Please wait while we sync your subscription.</p>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white overflow-y-auto">
                <Script src="https://checkout.razorpay.com/v1/checkout.js" />
                <div className="max-w-5xl w-full">
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                            <Zap className="text-blue-500" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Reactivate Your Account</h1>
                        <p className="text-gray-400 text-sm max-w-lg mx-auto">
                            Your subscription is currently inactive. Review our plans below and select one to restore full access to your dashboard.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(PLANS).map(([key, p]) => (
                            <div key={key} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all group flex flex-col relative overflow-hidden">
                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="mb-4 relative z-10">
                                    <h3 className="font-bold text-lg">{p.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <p className="text-2xl font-mono text-white">₹{p.basePrice}</p>
                                        <span className="text-xs text-gray-500">/mo</span>
                                    </div>
                                </div>

                                <ul className="text-xs space-y-3 text-gray-400 mb-8 flex-1 relative z-10">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {p.includedRefunds} Monthly Refunds
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        ₹{p.excessRate} Overage per unit
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Priority Support
                                    </li>
                                </ul>

                                <button
                                    onClick={async () => {
                                        // Simple Re-subscription Flow
                                        try {
                                            const res = await fetch('/api/razorpay/create-subscription', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ userId: auth.currentUser?.uid, planType: key })
                                            });
                                            const data = await res.json();

                                            if (data.error) { alert(data.error); return; }

                                            const options = {
                                                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                                                subscription_id: data.subscriptionId,
                                                name: "Ryyt",
                                                description: `${p.name} Reactivation`,
                                                handler: function () {
                                                    setIsVerifying(true);
                                                    // Polling Loop
                                                    let attempts = 0;
                                                    const maxAttempts = 20;

                                                    const checkStatus = setInterval(async () => {
                                                        attempts++;
                                                        if (attempts > maxAttempts) {
                                                            clearInterval(checkStatus);
                                                            alert("Payment received, but dashboard update is delayed. reloading...");
                                                            window.location.reload();
                                                            return;
                                                        }

                                                        // We need to fetch FRESH data, not rely on onSnapshot which might rely on component mount
                                                        // Actually fetching document directly is safer.
                                                        // Wait, we need 'getDoc' imported.
                                                        // It is imported in line 6.
                                                        try {
                                                            // Re-fetch logic
                                                            // Note: 'auth' is available in scope? Yes.
                                                            if (auth.currentUser) {
                                                                const verifySnap = await import('firebase/firestore').then(mod => mod.getDoc(doc(db, 'merchants', auth.currentUser!.uid)));
                                                                const verifyData = verifySnap.data() as { subscriptionStatus?: string } | undefined;
                                                                if (verifySnap.exists() && verifyData?.subscriptionStatus === 'active') {
                                                                    clearInterval(checkStatus);
                                                                    window.location.reload();
                                                                }
                                                            }
                                                        } catch (e) { console.error(e); }
                                                    }, 1000);
                                                },
                                            };
                                            if (!(window as unknown as { Razorpay: unknown }).Razorpay) {
                                                alert("Payment SDK not loaded. Please refresh.");
                                                return;
                                            }

                                            const rzp1 = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
                                            rzp1.open();
                                        } catch (e: unknown) {
                                            console.error(e);
                                            alert("Failed to start payment.");
                                        }
                                    }}
                                    className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors relative z-10"
                                >
                                    Select {p.name}
                                </button>
                            </div>
                        ))}
                    </div>

                    <button onClick={handleLogout} className="mt-12 text-gray-500 hover:text-white text-xs font-bold flex items-center gap-2 mx-auto transition-colors">
                        <LogOut size={12} /> Sign Out
                    </button>
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
