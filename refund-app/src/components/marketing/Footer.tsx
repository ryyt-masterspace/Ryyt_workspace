import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0A0A0A] pt-10 pb-6"> {/* Reduced padding */}
            <div className="container mx-auto px-6">

                {/* Main Grid - Tighter Gap */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"> {/* Reduced mb-12 to mb-8 */}

                    {/* Brand Column */}
                    <div className="space-y-3">
                        <div className="relative h-8 w-32">
                            <Image
                                src="/logo-white.png"
                                alt="Ryyt"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 max-w-xs">
                            The Financial Control Tower for modern merchants.
                        </p>
                        <div className="flex gap-3 pt-1">
                            <SocialIcon icon={Twitter} />
                            <SocialIcon icon={Linkedin} />
                        </div>
                    </div>

                    {/* Links Columns - Compact Typography */}
                    <div>
                        <h4 className="font-semibold text-white text-sm mb-3">Product</h4>
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                            <li><Link href="#features" className="hover:text-[#0052FF] transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-[#0052FF] transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-3">Company</h4>
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                            <li><Link href="#" className="hover:text-[#0052FF] transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-[#0052FF] transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-[#0052FF] transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-3">Legal</h4>
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                            <li><Link href="#" className="hover:text-[#0052FF] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-[#0052FF] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright Row */}
                <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-zinc-600">
                        &copy; {new Date().getFullYear()} Ryyt Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        All Systems Operational
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon: Icon }: { icon: any }) {
    return (
        <a href="#" className="p-1.5 bg-zinc-900 rounded-md text-zinc-400 hover:text-white hover:bg-[#0052FF] transition-all">
            <Icon size={14} />
        </a>
    );
}
