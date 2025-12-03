"use client";

import Image from "next/image";

const testimonials = [
    {
        id: 1,
        name: "Amit Patel",
        role: "Founder, UrbanKicks",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        content: "Refunds used to be a nightmare of screenshots and angry calls. Ryyt made it boringly simple. Our support tickets dropped by 80% in week one."
    },
    {
        id: 2,
        name: "Priya Sharma",
        role: "Ops Head, The Loom Co.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        content: "The best part is the transparency. Customers stop asking 'where is my money' because they can see the live status. It builds so much trust."
    },
    {
        id: 3,
        name: "Rahul Gupta",
        role: "CEO, TechGear",
        image: "https://randomuser.me/api/portraits/men/86.jpg",
        content: "We were drowning in UTR requests. Now, I just share the link and forget about it. It's the cleanest manual refund tool I've ever used."
    },
    {
        id: 4,
        name: "Sneha Reddy",
        role: "Founder, Glow & Co.",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        content: "I love that I don't need to integrate a payment gateway. It just works with my existing bank account. Simple, fast, and effective."
    },
    {
        id: 5,
        name: "Vikram Singh",
        role: "Director, FitLife",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        content: "The branded tracking page makes us look like a much bigger company. It's a small touch that adds a lot of premium feel to the brand."
    }
];

export default function TestimonialsMarquee() {
    return (
        <section className="py-24 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Loved by <span className="text-blue-500">modern founders.</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Join hundreds of D2C brands who turned refunds from a headache into a trust-building opportunity.
                </p>
            </div>

            {/* Marquee Container */}
            <div className="relative flex overflow-x-hidden group">
                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-20 pointer-events-none"></div>

                {/* Scrolling Track */}
                <div className="animate-marquee flex gap-6 whitespace-nowrap py-4">
                    {[...testimonials, ...testimonials].map((testimonial, index) => (
                        <div
                            key={`${testimonial.id}-${index}`}
                            className="w-[400px] flex-shrink-0 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors whitespace-normal"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
                                    <Image
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                "{testimonial.content}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
