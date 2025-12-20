'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push('/');
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <p className="text-sm font-mono animate-pulse">Redirecting to login / invitation only access...</p>
        </div>
    );
}
