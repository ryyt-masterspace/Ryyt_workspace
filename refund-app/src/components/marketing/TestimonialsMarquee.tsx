'use client';
import { motion } from 'framer-motion';

const reviews = [
    // --- LIQUIDITY & FINANCE ---
    { name: "Arjun K.", role: "Founder", text: "Finally stopped using my overdraft for refunds. Paying from the bank is a game changer." },
    { name: "Sarah L.", role: "Finance Head", text: "Razorpay used to hold our cash for 3 days. Ryyt cleared that bottleneck instantly." },
    { name: "Dev P.", role: "D2C Owner", text: "The dynamic QR saved us during the Diwali sale when our gateway wallet hit zero." },
    { name: "Vikram S.", role: "CFO", text: "Financial sovereignty is real. I control the money flow now, not the gateway." },
    { name: "Ananya M.", role: "Founder", text: "We were losing 2% on payment gateway reloading fees. Ryyt cut that to zero." },
    { name: "Rohan D.", role: "Ops Lead", text: "Just-in-time funding means my capital isn't stuck in a frozen wallet anymore." },
    { name: "Karthik R.", role: "E-com Manager", text: "Settling refunds instantly from the current account is how it should have always been." },
    { name: "Priya S.", role: "Director", text: "No more 'insufficient balance' errors on refund day. Peace of mind." },
    { name: "Amit B.", role: "Founder", text: "Cashflow is tight. Ryyt lets us hold cash until the very last second." },
    { name: "Sneha G.", role: "Finance", text: "The reconciliation between bank debit and refund status is flawless." },
    { name: "Rahul V.", role: "CEO", text: "We stopped keeping dead cash in the gateway wallet. That capital is now used for ads." },
    { name: "Zoya K.", role: "Founder", text: "T+1 compliance was a headache. Ryyt handled the RBI penalty risk for us." },

    // --- OPS & CX ---
    { name: "Mike T.", role: "Support Lead", text: "WISMO tickets dropped by 60% once we started sending tracking links." },
    { name: "Nisha P.", role: "Ops Manager", text: "The COD auto-collection is magic. My team stopped making 50 calls a day." },
    { name: "Varun J.", role: "Head of CX", text: "Customers trust the branded tracking page. It looks professional, like Amazon." },
    { name: "Sonia R.", role: "Founder", text: "No more typing IFSC codes manually. The typo errors are gone." },
    { name: "Kabir H.", role: "Logistics", text: "Handling 500+ COD returns was a nightmare. Ryyt automated the data entry." },
    { name: "Tara W.", role: "CS Head", text: "The 'Refund Initiated' email stops the panic. Customers know we aren't lying." },
    { name: "Aditya N.", role: "Founder", text: "Scan to Pay is brilliant. I cleared 50 refunds while drinking my morning coffee." },
    { name: "Meera C.", role: "Ops Lead", text: "The bulk import feature saves us 4 hours of manual work every Friday." },
    { name: "Rajiv M.", role: "D2C Brand", text: "Finally, a refund tool that understands COD friction." },
    { name: "Simran K.", role: "Founder", text: "The interface is beautiful. It feels like using Linear for Finance." },
    { name: "Sameer L.", role: "Finance", text: "Auditing is so much easier with the unified timeline view." },
    { name: "Pooja D.", role: "CEO", text: "Our Trustpilot score went up because customers actually get their money on time." },
];

interface Review {
    name: string;
    role: string;
    text: string;
}

const Row = ({ reviews, direction }: { reviews: Review[]; direction: 'left' | 'right' }) => (
    <div className="flex overflow-hidden relative w-full">
        <motion.div
            initial={{ x: direction === 'left' ? 0 : "-50%" }}
            animate={{ x: direction === 'left' ? "-50%" : 0 }}
            transition={{ duration: 50, ease: "linear", repeat: Infinity }}
            className="flex gap-6 py-4 pr-6 flex-shrink-0"
        >
            {[...reviews, ...reviews].map((review, i) => (
                <div key={i} className="w-[350px] flex-shrink-0 bg-zinc-900/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:border-[#0052FF]/30 transition-colors">
                    <p className="text-zinc-300 text-sm mb-4 leading-relaxed">&quot;{review.text}&quot;</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-500 border border-white/5">
                            {review.name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">{review.name}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">{review.role}</div>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div >
    </div >
);

// Split data into two rows
const row1 = reviews.slice(0, 12);
const row2 = reviews.slice(12, 24);

export default function TestimonialsMarquee() {
    return (
        <section className="py-20 relative z-10 overflow-hidden">
            <div className="container mx-auto px-4 text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Join founders who regained <span className="text-[#0052FF]">financial control</span>.
                </h2>
            </div>

            <div className="flex flex-col gap-6 relative">
                {/* Fade Masks */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-20 pointer-events-none" />

                <Row reviews={row1} direction="left" />
                <Row reviews={row2} direction="right" />
            </div>
        </section>
    );
}
