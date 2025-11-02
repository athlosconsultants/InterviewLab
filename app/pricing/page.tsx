'use client';

import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import PricingSuperCard from '@/components/PricingSuperCard';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-12 relative z-10 lg:px-0 lg:pt-0 lg:pb-0">
        <PricingSuperCard />
      </div>

      <Footer />
    </main>
  );
}
