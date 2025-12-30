import { getPostBySlug, getAllPosts } from '@/lib/blog';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const post = getPostBySlug(slug);
    return { title: `${post.title} | Ryyt` };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const post = getPostBySlug(slug);

    return (
        <article className="relative min-h-screen pt-32 pb-24 px-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0052FF]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-3xl relative z-10">
                <Link href="/blog" className="inline-flex items-center text-zinc-500 hover:text-white mb-12 transition-colors text-sm font-medium">
                    <ArrowLeft size={16} className="mr-2" /> Back to Library
                </Link>

                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">{post.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-zinc-500 border-l-2 border-[#0052FF] pl-4">
                        <p>{new Date(post.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                        <p>•</p>
                        <p>{post.description}</p>
                    </div>
                </header>

                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#0052FF] prose-img:rounded-xl">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {/* Conversion Hook */}
                <div className="mt-20 p-10 rounded-3xl bg-gradient-to-br from-[#0052FF]/20 to-transparent border border-[#0052FF]/30 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Facing this problem?</h3>
                    <p className="text-zinc-300 mb-8">Ryyt automates this entire process so you don&apos;t have to worry about compliance or delays.</p>
                    <Link href="/#features" className="inline-block px-8 py-3 bg-[#0052FF] hover:bg-[#0040DD] text-white font-bold rounded-full transition-all shadow-lg shadow-blue-900/20">
                        Get Started Free
                    </Link>
                </div>
            </div>
        </article>
    );
}
