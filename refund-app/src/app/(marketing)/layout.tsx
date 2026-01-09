import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import BookDemoModal from '@/components/marketing/BookDemoModal';
import { ModalProvider } from '@/context/ModalContext';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white">
            <ModalProvider>
                <Navbar />
                {children}
                <Footer />
                <BookDemoModal />
            </ModalProvider>
        </div>
    );
}
