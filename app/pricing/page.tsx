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

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent"
          >
            Choose Your Access Duration
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            One-time payment · No subscriptions · Immediate access
          </motion.p>
        </div>

        {/* Shared Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16 bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8 md:p-10"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Every Plan Includes
          </h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
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
                <span className="text-slate-700 font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
              className={`relative rounded-2xl bg-white border-2 transition-all duration-300 ${
                tier.recommended
                  ? 'border-[#3E8BFF] shadow-2xl shadow-[#3E8BFF]/20 scale-105'
                  : hoveredTier === tier.id
                    ? 'border-[#3DCBFF] shadow-xl shadow-[#3DCBFF]/10'
                    : 'border-slate-200 shadow-lg'
              }`}
              style={{
                transform:
                  hoveredTier === tier.id && !tier.recommended
                    ? 'translateY(-4px) scale(1.02)'
                    : tier.recommended
                      ? 'scale(1.05)'
                      : 'scale(1)',
              }}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                    {tier.badge}
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Duration Badge */}
                <div className="flex items-center justify-center gap-2 mb-4 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {tier.duration}
                  </span>
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent">
                  {tier.name}
                </h3>

                {/* Pricing */}
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-slate-900 mb-1">
                    {tier.price}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    One-time payment
                  </p>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handlePurchase(tier.id)}
                  disabled={loading !== null}
                  className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                    tier.recommended
                      ? 'bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] hover:shadow-xl hover:shadow-[#3E8BFF]/30 text-white'
                      : 'bg-white border-2 border-[#3E8BFF] text-[#3E8BFF] hover:bg-gradient-to-r hover:from-[#3E8BFF]/10 hover:to-[#3DCBFF]/10 hover:shadow-lg'
                  }`}
                  style={{
                    transform:
                      hoveredTier === tier.id ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {loading === tier.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    tier.cta
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reassurance Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-slate-500 text-sm">
            All plans provide full access to every feature during your selected
            timeframe
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
