import Image from "next/image";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="w-full bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
            <Link href="/" className="flex items-center">
                <div className="relative h-12 w-40">
                    <Image
                        src="/assets/ryyt-logo-blue.png"
                        alt="RYYT Logo"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </Link>
            <Link
                href="/login"
                className="bg-[#0052FF] text-white px-6 h-9 rounded-lg text-sm flex items-center justify-center font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
                Login
            </Link>
        </nav>
    );
}
