import Image from "next/image";
import InteractiveBackground from "@/components/InteractiveBackground";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center pt-32 px-6 relative overflow-hidden">
      <InteractiveBackground />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center z-10 mb-20 relative">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
          The Trust Layer <br />
          <span className="text-gradient-blue">for Refunds</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Turn refund anxiety into customer loyalty. The single source of truth for every transaction, powered by transparency.
        </p>

        <div className="flex items-center justify-center gap-6">
          <button className="text-white font-medium hover:text-gray-300 transition-colors">
            Request demo
          </button>
          <button className="glass-button px-8 py-4 rounded-xl text-white font-medium flex items-center gap-2 group border border-white/10 bg-gradient-to-b from-white/10 to-transparent hover:border-white/20">
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dashboard Feature Image (Mockup) */}
      <DemoDashboard />

    </main>
  );
}
