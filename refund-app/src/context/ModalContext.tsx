'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import LeadCaptureModal from '@/components/marketing/LeadCaptureModal';

interface ModalContextType {
    openLeadModal: () => void;
    closeLeadModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isLeadOpen, setIsLeadOpen] = useState(false);

    const openLeadModal = () => setIsLeadOpen(true);
    const closeLeadModal = () => setIsLeadOpen(false);

    return (
        <ModalContext.Provider value={{ openLeadModal, closeLeadModal }}>
            {children}
            {/* The Modal lives here, accessible globally */}
            <LeadCaptureModal isOpen={isLeadOpen} onClose={closeLeadModal} />
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
