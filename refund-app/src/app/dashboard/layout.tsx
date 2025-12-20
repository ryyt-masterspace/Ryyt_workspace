'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const auth = getAuth(app);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // 1. Check Existence
                    const userRef = doc(db, 'merchants', user.uid);
                    const userSnap = await getDoc(userRef);

                    // 2. Auto-Create if Missing
                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            email: user.email,
                            brandName: "New Merchant",
                            logo: "",
                            createdAt: serverTimestamp(),
                            planType: "startup",
                            subscriptionStatus: "active",
                            lastPaymentDate: serverTimestamp(),
                            settings: {
                                slaDays: 2,
                                paymentMethod: 'UPI'
                            }
                        });

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
                        setStatus("active");
                    } else {
                        setStatus(userSnap.data()?.subscriptionStatus || "active");
                    }
                } catch (error) {
                    console.error("Layout Init Error:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [auth]);

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (status === "suspended") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
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

                    <p className="mt-6 text-[10px] text-gray-600">
                        Ryyt Enterprise Security Layer v2.1
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
