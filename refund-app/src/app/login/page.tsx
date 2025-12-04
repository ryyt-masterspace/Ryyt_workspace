"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <div className="text-2xl font-bold text-white tracking-tight">
                            RYYT <span className="text-blue-500">.</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
                    <p className="text-gray-400 text-sm">Enter your credentials to access the dashboard.</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="name@company.com"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            required
                        />

                        <div className="pt-2">
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Sign In
                            </Button>
                        </div>
                    </form>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        Don't have an account? <span className="text-gray-400">Contact Support</span>
                    </p>
                </div>
            </div>
        </main>
    );
}
