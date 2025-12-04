import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="w-full h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 backdrop-blur-md bg-black/10 border-b border-white/5">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center">
                <div className="relative h-12 w-40">
                    <Image
                        src="/assets/ryyt-logo-white-full.png"
                        alt="RYYT Logo"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </Link>

            {/* Center: Links */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Features
                </Link>
                <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    How it works
                </Link>
                <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Pricing
                </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
                <Link href="#" className="text-sm font-medium text-white hover:text-gray-300 transition-colors hidden md:block">
                    Request demo
                </Link>
                <Link
                    href="/login"
                    className="px-6 h-10 rounded-lg border border-white/20 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center backdrop-blur-sm"
                >
                    Login
                </Link>
            </div>
        </nav>
    );
}
