import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram, Youtube, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0A0A0A] pt-10 pb-6 relative z-20">
            <div className="container mx-auto px-6">

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        {/* Logo */}
                        <div className="relative h-12 w-40">
                            <Image
                                src="/logo-white.png"
                                alt="Ryyt"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                            Regain your Financial Sovereignty. <br />
                            Stop letting gateways control your cash flow.
                        </p>

                        {/* Social Icons (Updated) */}
                        <div className="flex gap-3 pt-2">
                            <SocialIcon
                                icon={Instagram}
                                href="https://www.instagram.com/ryyt.social?igsh=MTZjZjJmM2o2czFtZw=="
                            />
                            <SocialIcon
                                icon={Linkedin}
                                href="https://www.linkedin.com/company/ryyt/"
                            />
                            <SocialIcon
                                icon={Youtube}
                                href="https://youtube.com/@ryytforyou?si=dGFtcqCWjYONOJy5"
                            />
                            <SocialIcon
                                icon={Mail}
                                href="mailto:shuvam@ryyt.in"
                            />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-semibold text-white text-sm mb-3">Product</h4>
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                            <li><Link href="#features" className="hover:text-[#0052FF] transition-colors">Solutions</Link></li>
                            <li><Link href="#why-us" className="hover:text-[#0052FF] transition-colors">Why Ryyt</Link></li>
                            <li><Link href="#faq" className="hover:text-[#0052FF] transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-3">Company</h4>
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                            <li><Link href="/blog" className="hover:text-[#0052FF] transition-colors">Blog</Link></li>
                            <li><Link href="/about" className="hover:text-[#0052FF] transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-[#0052FF] transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-[#0052FF] transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-3">Legal</h4>
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                            <li><Link href="/privacy" className="hover:text-[#0052FF] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-[#0052FF] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright Row */}
                <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-zinc-600">
                        &copy; {new Date().getFullYear()} Ryyt Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        All Systems Operational
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon: Icon, href }: { icon: any, href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-zinc-900/50 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#0052FF] hover:border-[#0052FF] transition-all"
        >
            <Icon size={16} />
        </a>
    );
}
