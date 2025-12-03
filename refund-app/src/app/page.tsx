```javascript
import Image from "next/image";
import InteractiveBackground from "@/components/InteractiveBackground";
import DemoDashboard from "@/components/DemoDashboard";

import SocialProof from "@/components/SocialProof";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-blue-500/30">
      <InteractiveBackground />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                The Trust Layer
              </span>
              <span className="block text-blue-500">
                for Refunds
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
              Turn refund anxiety into customer loyalty. The single source of truth 
              for every transaction, powered by transparency.
            </p>

            <div className="flex items-center gap-4">
              <button className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors">
                Request demo
              </button>
              <button className="px-8 py-4 glass-button rounded-full font-medium flex items-center gap-2 group">
                Get Started 
                <span className="group-hover:translate-x-1 transition-transform">›</span>
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <DemoDashboard />

          {/* Social Proof */}
          <SocialProof />
        </div>
      {/* Dashboard Feature Image (Mockup) */}
      <DemoDashboard />

    </main>
  );
}
