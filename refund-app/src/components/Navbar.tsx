import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="w-full bg-white border-b border-gray-100 h-16 flex items-center px-6 sticky top-0 z-50">
            <Link href="/" className="flex items-center">
                <div className="relative h-8 w-24">
                    <Image
                        src="/assets/ryyt-icon-blue.png"
                        alt="RYYT Logo"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </Link>
        </nav>
    );
}
