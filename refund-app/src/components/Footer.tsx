"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
                        </div >
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            The single source of truth for refunds. Build trust, reduce anxiety, and automate your support.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                                    <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
                                </div>
                            ))}
                        </div>
                    </div >

        {/* Links Columns */ }
        < div >
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">How it Works</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Changelog</Link></li>
                        </ul>
                    </div >

                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div >

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} Ryyt Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                All Systems Operational
            </div>
        </div>
            </div >
        </footer >
    );
}
