import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center pt-32 px-6 bg-starfield relative overflow-hidden">

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center z-10 mb-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white">
          The Trust Layer for <span className="text-gradient-blue">Refunds</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Turn refund anxiety into customer loyalty. The single source of truth for every transaction, powered by transparency.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button className="glass-button px-8 py-4 rounded-full text-white font-medium flex items-center gap-2 group">
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dashboard Feature Image (Mockup) */}
      <div className="w-full max-w-6xl relative z-10 animate-float">
        <div className="rounded-[20px] border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

          {/* Mock UI Container */}
          <div className="relative bg-[#0A0A0A] p-2 md:p-4 rounded-[20px]">
            {/* Window Controls */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>

            {/* Mock Content Placeholder (Until we build the real dashboard) */}
            <div className="w-full aspect-[16/9] bg-white/5 rounded-lg border border-white/5 flex items-center justify-center">
              <p className="text-gray-500 font-mono text-sm">Dashboard Interface Preview</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
