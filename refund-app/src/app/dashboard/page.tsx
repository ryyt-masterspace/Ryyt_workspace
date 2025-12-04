"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const auth = getAuth(app);

    useEffect(() => {
        // Check if user is logged in
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                // If not logged in, send to login page
                router.push("/login");
            } else {
                // If logged in, save user info
                setUser(currentUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth, router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">{user.email}</span>
                        <Button variant="ghost" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </div>

                <div className="p-8 border border-white/10 rounded-lg bg-white/5">
                    <p className="text-gray-400">Welcome to your secure workspace.</p>
                </div>
            </div>
        </div>
    );
}
