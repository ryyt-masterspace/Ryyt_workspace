import Image from "next/image";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="w-full h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 backdrop-blur-sm bg-black/20 border-b border-white/5">
            <Link href="/" className="flex items-center">
                <div className="relative h-10 w-32">
                    {/* Using the white logo for dark mode if available, otherwise blue might need adjustment or filter */}
                    {/* Assuming we might need a white logo, but user provided blue. Let's use blue for now or filter it to white if needed. 
              Actually, user provided 'ryyt-logo-white.png' earlier! Let's use that. */}
                    <Image
                        src="/assets/ryyt-logo-white.png"
                        alt="RYYT Logo"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden md:block">
                    How it works
                </Link>
                <Link
                    href="/login"
                    className="px-6 h-10 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center"
                >
                    Login
                </Link>
            </div>
        </nav>
    );
}
