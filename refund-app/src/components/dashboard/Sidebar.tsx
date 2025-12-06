"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Activity, AlertTriangle, Search, Settings, LogOut, XCircle, CheckCircle2 } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const auth = getAuth(app);

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen bg-[#050505] border-r border-white/10 flex flex-col z-40 transition-all duration-300 w-[64px] md:w-[240px]">

            {/* ZONE 1: LOGO & HOME */}
            <div className="flex-none p-4 md:p-6 border-b border-white/5">
                {/* Logo */}
                <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs shrink-0">
                        R
                    </div>
                    <span className="font-bold text-lg text-white hidden md:block tracking-tight">
                        Ryyt
                    </span>
                </div>

                {/* Home Link */}
                <Link
                    href="/dashboard"
                    className={`flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive("/dashboard")
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                >
                    <LayoutGrid strokeWidth={isActive("/dashboard") ? 2.5 : 2} className="w-5 h-5" />
                    <span className="text-sm font-medium hidden md:block">Home</span>
                </Link>
            </div>

            {/* ZONE 2: WORKSPACE */}
            <div className="flex-1 overflow-y-auto py-6 px-2 md:px-4">
                <div className="px-3 mb-2 hidden md:block">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Workspace</span>
                </div>

                <div className="flex flex-col gap-1">
                    {/* Active Refunds */}
                    <Link
                        href="/dashboard/active"
                        className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive("/dashboard/active")
                            ? "bg-blue-600/10 text-blue-400"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <Activity strokeWidth={isActive("/dashboard/active") ? 2.5 : 2} className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:block">Active Refunds</span>
                    </Link>

                    {/* SLA Breaches */}
                    <Link
                        href="/dashboard/breaches"
                        className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive("/dashboard/breaches")
                            ? "bg-red-500/10 text-red-500"
                            : "text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                            }`}
                    >
                        <AlertTriangle strokeWidth={isActive("/dashboard/breaches") ? 2.5 : 2} className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:block">SLA Breaches</span>
                    </Link>

                    {/* Failures */}
                    <Link
                        href="/dashboard/failures"
                        className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive("/dashboard/failures")
                            ? "bg-rose-500/10 text-rose-500"
                            : "text-gray-400 hover:bg-rose-500/10 hover:text-rose-400"
                            }`}
                    >
                        <XCircle strokeWidth={isActive("/dashboard/failures") ? 2.5 : 2} className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:block">Failures</span>
                    </Link>

                    {/* Settled */}
                    <Link
                        href="/dashboard/settled"
                        className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive("/dashboard/settled")
                            ? "bg-green-500/10 text-green-500"
                            : "text-gray-400 hover:bg-green-500/10 hover:text-green-400"
                            }`}
                    >
                        <CheckCircle2 strokeWidth={isActive("/dashboard/settled") ? 2.5 : 2} className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:block">Settled</span>
                    </Link>

                    {/* Global Search */}
                    <Link
                        href="/dashboard/search"
                        className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive("/dashboard/search")
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <Search strokeWidth={isActive("/dashboard/search") ? 2.5 : 2} className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:block">Search</span>
                    </Link>
                </div>
            </div>

            {/* ZONE 3: SETTINGS & LOGOUT (Bottom) */}
            <div className="p-4 border-t border-white/5 mt-auto bg-[#050505]">
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:bg-white/5 hover:text-white mb-1 group ${isActive("/dashboard/settings") ? "bg-white/10 text-white" : ""
                        }`}
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium hidden md:block">Settings</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center md:justify-start gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
                >
                    <LogOut className="w-5 h-5 group-hover:stroke-red-400" />
                    <span className="text-sm font-medium hidden md:block">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
