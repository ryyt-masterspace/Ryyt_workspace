import Navbar from '@/components/marketing/Navbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            {children}
        </div>
    );
}
