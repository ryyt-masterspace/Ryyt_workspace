import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center pt-32 px-6 bg-starfield relative overflow-hidden">

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
      <div className="w-full max-w-6xl relative z-10 animate-float">
        <div className="rounded-[24px] border border-white/10 bg-[#050505] shadow-2xl overflow-hidden relative group">
          {/* Top Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

          {/* Mock UI Container */}
          <div className="relative bg-[#0A0A0A] p-1">
            <div className="bg-[#0f0f0f] rounded-[20px] overflow-hidden border border-white/5">
              {/* Header of Mockup */}
              <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-[#111]">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">Refund Process</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 rounded-full bg-white/10"></div>
                </div>
              </div>

              {/* Body of Mockup */}
              <div className="p-8 grid grid-cols-3 gap-8 h-[400px]">
                {/* Left Col */}
                <div className="col-span-2 space-y-6">
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-white/10 rounded"></div>
                    <div className="h-10 w-full bg-[#1a1a1a] rounded border border-white/5"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-1/4 bg-white/10 rounded"></div>
                    <div className="h-10 w-full bg-[#1a1a1a] rounded border border-white/5"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 w-full bg-[#1a1a1a] rounded border border-white/5"></div>
                    <div className="h-24 w-full bg-[#1a1a1a] rounded border border-white/5"></div>
                  </div>
                </div>
                {/* Right Col (Chat/Status) */}
                <div className="col-span-1 bg-[#161616] rounded-xl border border-white/5 p-4 space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-blue-600/20 text-blue-400 p-3 rounded-l-xl rounded-tr-xl text-xs max-w-[80%] border border-blue-500/10">
                      Refund initiated. Waiting for bank confirmation.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#222] text-gray-400 p-3 rounded-r-xl rounded-tl-xl text-xs max-w-[80%] border border-white/5">
                      Customer notified via WhatsApp.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
