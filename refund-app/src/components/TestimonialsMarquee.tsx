"use client";

import Image from "next/image";

const testimonials = [
    {
        id: 1,
        name: "Arjun Mehta",
        role: "Founder, UrbanKicks",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        content: "Customers would DM us 'scam?' if the refund took 2 days. Now they see the tracking link and chill. It's night and day."
    },
    {
        id: 2,
        name: "Priya Sharma",
        role: "Ops Head, The Loom Co.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        content: "Matching UTRs from bank statements to Excel sheets was my Sunday nightmare. Ryyt just auto-fills it. I actually have weekends now."
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
    },
    {
        id: 6,
        name: "Ananya Das",
        role: "Founder, EcoWear",
        image: "https://randomuser.me/api/portraits/women/22.jpg",
        content: "I had a customer threaten to sue over a ₹2000 refund because our support team missed his email. Never again. Ryyt keeps them posted."
    },
    {
        id: 7,
        name: "Karthik R.",
        role: "Co-founder, BrewBox",
        image: "https://randomuser.me/api/portraits/men/11.jpg",
        content: "Simple, fast, no coding. I set it up in 5 minutes and processed my first refund while drinking coffee. It just works."
    },
    {
        id: 8,
        name: "Meera Nair",
        role: "Head of CX, Aura Beauty",
        image: "https://randomuser.me/api/portraits/women/90.jpg",
        content: "We used to send screenshots of payment success. It looked so unprofessional. The branded page makes us look like Myntra."
    },
    {
        id: 9,
        name: "Siddharth Jain",
        role: "Founder, GadgetZone",
        image: "https://randomuser.me/api/portraits/men/64.jpg",
        content: "My accountant loves it. The export feature means he doesn't have to chase me for transaction details at the end of the month."
    },
    {
        id: 10,
        name: "Riya Kapoor",
        role: "Owner, The Gift Studio",
        image: "https://randomuser.me/api/portraits/women/56.jpg",
        content: "During Diwali rush, we had 50 refunds. Without Ryyt, I would have gone mad checking bank apps. It saved my sanity."
    },
    {
        id: 11,
        name: "Aditya Verma",
        role: "Founder, StreetStyle",
        image: "https://randomuser.me/api/portraits/men/78.jpg",
        content: "Our GenZ customers expect instant updates. The WhatsApp/Email notifications Ryyt sends are a lifesaver. No more 'where is my money?'"
    },
    {
        id: 12,
        name: "Nisha Patel",
        role: "Ops Manager, PureEarth",
        image: "https://randomuser.me/api/portraits/women/33.jpg",
        content: "The 'Update Status' button is my favorite. I just click 'Processed' and the customer gets an email. No more drafting replies manually."
    },
    {
        id: 13,
        name: "Varun Chopra",
        role: "Director, LuxeLeather",
        image: "https://randomuser.me/api/portraits/men/52.jpg",
        content: "Premium products need premium service. A text email saying 'refunded' isn't enough anymore. Ryyt adds that professional touch."
    },
    {
        id: 14,
        name: "Sana Khan",
        role: "Founder, TinyToes",
        image: "https://randomuser.me/api/portraits/women/18.jpg",
        content: "I'm a solo founder. I don't have time to answer calls. Ryyt answers them for me by keeping the customer informed."
    },
    {
        id: 15,
        name: "Rohan Malhotra",
        role: "CEO, FitGear",
        image: "https://randomuser.me/api/portraits/men/29.jpg",
        content: "We saw a 30% drop in support tickets in the first month. That's 30% more time to sell and less time fighting fires."
    },
    {
        id: 16,
        name: "Deepa Iyer",
        role: "Co-founder, Veda Roots",
        image: "https://randomuser.me/api/portraits/women/95.jpg",
        content: "Our older customers struggle with tech. The SMS updates keep them informed without them needing to login anywhere. It's very inclusive."
    },
    {
        id: 17,
        name: "Kabir Singh",
        role: "Founder, UrbanDecor",
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        content: "The 'Failure Recovery' feature saved us. Customer gave wrong UPI, Ryyt got the right one automatically. Magic."
    },
    {
        id: 18,
        name: "Tanvi Shah",
        role: "Head of Ops, Bling Jewelry",
        image: "https://randomuser.me/api/portraits/women/62.jpg",
        content: "High ticket items make people nervous. Seeing a 'Processing' status with a bank ref ID calms them down instantly. Trust is everything."
    }
];

export default function TestimonialsMarquee() {
    return (
        <section className="py-24 relative z-10 overflow-hidden bg-red-900/20 border-y border-red-500">
            <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Loved by <span className="text-blue-500">modern founders.</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Join hundreds of D2C brands who turned refunds from a headache into a trust-building opportunity.
                </p>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden group">
                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-20 pointer-events-none"></div>

                {/* Scrolling Track */}
                <div
                    className="animate-marquee flex w-max gap-6 py-4"
                    style={{ animationDuration: "120s" }}
                >
                    {[...testimonials, ...testimonials].map((testimonial, index) => (
                        <div
                            key={`${testimonial.id}-${index}`}
                            className="w-[400px] flex-shrink-0 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors whitespace-normal flex flex-col"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed italic">
                                "{testimonial.content}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
