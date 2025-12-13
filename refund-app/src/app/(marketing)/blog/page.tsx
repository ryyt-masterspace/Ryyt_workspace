import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

export const metadata = {
    title: 'Financial Control Insights | Ryyt Blog',
    description: 'Expert guides on Refund Ops, RBI Compliance, and Liquidity Management.',
};

export default function BlogIndex() {
    const posts = getAllPosts();

    return (
        <section className="relative min-h-screen pt-40 pb-20 px-6">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#0052FF]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="text-center mb-24">
                    <span className="text-[#0052FF] font-bold tracking-widest uppercase text-sm mb-4 block">Ryyt Insights</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                        The Financial Control <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Knowledge Base.</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group relative h-full">
                            <div className="h-full bg-zinc-900/40 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:border-[#0052FF]/50 transition-all duration-300 flex flex-col">
                                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6 uppercase tracking-wider font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-[#0052FF] transition-colors">{post.title}</h2>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">{post.description}</p>
                                <div className="flex items-center text-[#0052FF] font-bold text-sm">
                                    Read Article <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
