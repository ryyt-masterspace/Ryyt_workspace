'use client';

import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // 1. Check Existence
                const userRef = doc(db, 'merchants', user.uid);
                const userSnap = await getDoc(userRef);

                // 2. Auto-Create if Missing
                if (!userSnap.exists()) {
                    // This user was manually authorized by Admin, but needs a DB profile
                    await setDoc(userRef, {
                        email: user.email,
                        brandName: "New Merchant", // Placeholder
                        createdAt: new Date(),
                        settings: {
                            slaDays: 2,
                            paymentMethod: 'UPI'
                        }
                    });
                    console.log("Merchant Profile Auto-Created for:", user.email);
                }
            }
        });
        return () => unsubscribe();
    }, [auth]);

    return <>{children}</>;
}
