'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
    {
        question: "Does Ryyt touch my money?",
        answer: "No. Ryyt is a &apos;Financial Control Tower,&apos; not a bank. We generate the payment instructions (QR Codes / UPI Links), but the actual money moves directly from your banking app to the customer. We never hold your funds."
    },
    {
        question: "How does the &apos;Scan to Pay&apos; work?",
        answer: "It&apos;s just like paying a vendor at a shop. Ryyt generates a dynamic QR code with the customer&apos;s exact refund amount and VPA. You scan it with your business phone (GPay/PhonePe/Paytm), and the refund is instant. No typing required."
    },
    {
        question: "Is this compliant with RBI guidelines?",
        answer: "Yes. Ryyt is specifically designed to help you meet the RBI&apos;s &apos;T+1 Refund&apos; mandate. Our dashboard tracks SLA breaches automatically so you avoid the ₹100/day penalty for delayed settlements."
    },
    {
        question: "Do I need developer help to integrate?",
        answer: "Zero. Ryyt is a standalone dashboard. You can start processing refunds via Manual Entry or Bulk CSV Import immediately. No API integration required to get started."
    },
    {
        question: "Does it work for COD orders?",
        answer: "Ryyt is built *specifically* for COD. We automatically send a secure link to your customer to collect their UPI details, validate them, and present them to you for payment. No more phone calls."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 relative z-10">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                        Clear Answers.
                    </h2>
                    <p className="text-zinc-400">Everything you need to know about reclaiming your financial control.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === i
                                ? 'bg-zinc-900/80 border-[#0052FF]/50 shadow-[0_0_30px_-10px_rgba(0,82,255,0.15)]'
                                : 'bg-zinc-900/20 border-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className="p-6 flex justify-between items-center">
                                <h3 className={`font-medium transition-colors ${openIndex === i ? 'text-white' : 'text-zinc-300'}`}>
                                    {faq.question}
                                </h3>
                                <Plus
                                    className={`text-zinc-500 transition-transform duration-300 ${openIndex === i ? 'rotate-45 text-[#0052FF]' : ''}`}
                                    size={20}
                                />
                            </div>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
