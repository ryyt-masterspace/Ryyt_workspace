'use client';
import FinalHero from '@/components/marketing/FinalHero';
import BentoFeatures from '@/components/marketing/BentoFeatures';
import WhyUs from '@/components/marketing/WhyUs';
import Pricing from '@/components/marketing/Pricing';
import TestimonialsMarquee from '@/components/marketing/TestimonialsMarquee';
import FAQ from '@/components/marketing/FAQ';
import MouseSpotlight from '@/components/marketing/MouseSpotlight';

export default function LandingPage() {

  return (
    <main className="relative min-h-screen bg-[#0A0A0A] text-white selection:bg-[#0052FF]/30 overflow-x-hidden">
      {/* 1. GLOBAL BACKGROUND LAYERS (The Consistency Fix) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MouseSpotlight />
      </div>

      {/* 2. CONTENT LAYERS (Must be Transparent) */}
      <div className="relative z-10">
        <FinalHero />
        <BentoFeatures />
        <WhyUs />
        <Pricing />
        <TestimonialsMarquee />
        <FAQ />
      </div>
    </main>
  );
}
