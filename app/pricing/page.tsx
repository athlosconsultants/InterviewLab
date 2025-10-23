'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { Check, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type PassTier = '48h' | '7d' | '30d' | 'lifetime';

interface TierConfig {
  id: PassTier;
  name: string;
  price: string;
  duration: string;
  cta: string;
  badge?: string;
  recommended?: boolean;
}

const TIERS: TierConfig[] = [
  {
    id: '48h',
    name: '48-Hour Intensive',
    price: 'A$29.99',
    duration: '2 Days',
    cta: 'Start Intensive',
  },
  {
    id: '7d',
    name: '7-Day Accelerator',
    price: 'A$59.99',
    duration: '7 Days',
    cta: 'Begin Accelerator',
    badge: 'Most Popular',
    recommended: true,
  },
  {
    id: '30d',
    name: '30-Day Development',
    price: 'A$99.99',
    duration: '30 Days',
    cta: 'Start Development',
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    price: 'A$199.99',
    duration: 'Forever',
    cta: 'Unlock Lifetime',
    badge: 'Best Value',
  },
];

// Shared features across all plans
const SHARED_FEATURES = [
  'Unlimited interview sessions',
  'Comprehensive AI feedback reports',
  'Voice & text interaction modes',
  'Adaptive difficulty across all stages',
  'Multi-industry role coverage',
  'Performance tracking & analytics',
];

export default function PricingPage() {
  const [loading, setLoading] = useState<PassTier | null>(null);
  const [hoveredTier, setHoveredTier] = useState<PassTier | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PassTier>('7d'); // Default: 7-Day Accelerator

  const handlePurchase = async (tier: PassTier) => {
    setLoading(tier);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.status === 401) {
        toast.error('Please sign in first');
        window.location.href = '/sign-in?redirect=/pricing';
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout'
      );
      setLoading(null);
    }
  };

  // Separate time-based plans from lifetime
  const timeLimitedPlans = TIERS.filter((t) => t.id !== 'lifetime');
  const lifetimePlan = TIERS.find((t) => t.id === 'lifetime')!;
  const currentPlan = TIERS.find((t) => t.id === selectedPlan)!;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-12 relative z-10">
        {/* Compact Hero */}
        <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent"
          >
            Choose Your Access
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-sm md:text-base text-slate-600"
          >
            One-time payment · Immediate access
          </motion.p>
        </div>

        {/* Mobile-First Pill Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-md mx-auto mb-6 md:mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border-2 border-slate-200">
            <div className="grid grid-cols-3 gap-1.5">
              {timeLimitedPlans.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedPlan(tier.id)}
                  className={`relative px-2 py-2 rounded-xl font-semibold text-xs transition-all duration-300 ${
                    selectedPlan === tier.id
                      ? 'bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white shadow-lg scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tier.id === '7d' &&
                    tier.badge &&
                    selectedPlan !== tier.id && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-[9px] font-bold rounded-full whitespace-nowrap shadow-md">
                        {tier.badge}
                      </span>
                    )}
                  <div className="text-center">
                    <div className="font-bold">{tier.duration}</div>
                    <div className="text-[10px] opacity-90 mt-0.5">
                      {tier.price}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards: Selected Plan + Lifetime */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto mb-8 md:mb-12">
          {/* Selected Time-Limited Plan Card */}
          <motion.div
            key={selectedPlan}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHoveredTier(selectedPlan)}
            onMouseLeave={() => setHoveredTier(null)}
            className="relative rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-[#3E8BFF] shadow-2xl shadow-[#3E8BFF]/20 transition-all duration-300"
            style={{
              transform:
                hoveredTier === selectedPlan
                  ? 'translateY(-4px) scale(1.02)'
                  : 'scale(1)',
            }}
          >
            {/* Badge */}
            {currentPlan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-[10px] md:text-xs font-semibold whitespace-nowrap shadow-lg">
                  {currentPlan.badge}
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Duration Badge */}
              <div className="flex items-center justify-center gap-2 mb-3 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">
                  {currentPlan.duration}
                </span>
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent">
                {currentPlan.name}
              </h3>

              {/* Pricing */}
              <div className="text-center mb-6 md:mb-8">
                <div className="text-5xl md:text-6xl font-bold text-slate-900 mb-1">
                  {currentPlan.price}
                </div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  One-time payment
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={() => handlePurchase(currentPlan.id)}
                disabled={loading !== null}
                className="w-full h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] hover:shadow-xl hover:shadow-[#3E8BFF]/30 text-white"
                style={{
                  transform:
                    hoveredTier === selectedPlan ? 'translateY(-2px)' : 'none',
                }}
              >
                {loading === currentPlan.id ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  currentPlan.cta
                )}
              </Button>
            </div>
          </motion.div>

          {/* Lifetime Plan Card (Price Anchor) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onMouseEnter={() => setHoveredTier('lifetime')}
            onMouseLeave={() => setHoveredTier(null)}
            className="relative rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-slate-200 shadow-lg transition-all duration-300"
            style={{
              transform:
                hoveredTier === 'lifetime'
                  ? 'translateY(-4px) scale(1.02)'
                  : 'scale(1)',
            }}
          >
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-[10px] md:text-xs font-semibold whitespace-nowrap shadow-lg">
                {lifetimePlan.badge}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Duration Badge */}
              <div className="flex items-center justify-center gap-2 mb-3 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">
                  {lifetimePlan.duration}
                </span>
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent">
                {lifetimePlan.name}
              </h3>

              {/* Pricing */}
              <div className="text-center mb-6 md:mb-8">
                <div className="text-5xl md:text-6xl font-bold text-slate-900 mb-1">
                  {lifetimePlan.price}
                </div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  One-time payment
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={() => handlePurchase('lifetime')}
                disabled={loading !== null}
                className="w-full h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 bg-white border-2 border-[#3E8BFF] text-[#3E8BFF] hover:bg-gradient-to-r hover:from-[#3E8BFF]/10 hover:to-[#3DCBFF]/10 hover:shadow-lg"
                style={{
                  transform:
                    hoveredTier === 'lifetime' ? 'translateY(-2px)' : 'none',
                }}
              >
                {loading === 'lifetime' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  lifetimePlan.cta
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Shared Features Section - Moved to Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg p-6 md:p-10"
        >
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6 text-center">
            Every Plan Includes
          </h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
            {SHARED_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <span className="text-sm md:text-base text-slate-700 font-medium">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Reassurance Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xs md:text-sm text-slate-500">
            All plans provide full access to every feature during your selected
            timeframe
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
