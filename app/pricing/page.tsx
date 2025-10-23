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
  tagline: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  recommended?: boolean;
}

const TIERS: TierConfig[] = [
  {
    id: '48h',
    name: '48-Hour Intensive',
    tagline: 'Last-minute preparation',
    price: 'A$29.99',
    duration: '2 Days',
    description: 'For last-minute preparation before an important interview.',
    features: [
      'Unlimited interview sessions',
      'Comprehensive AI feedback',
      'Voice & text interaction',
    ],
    cta: 'Start Intensive',
  },
  {
    id: '7d',
    name: '7-Day Accelerator',
    tagline: 'Refine your answers',
    price: 'A$59.99',
    duration: '7 Days',
    description:
      'For professionals refining their answers over multiple sessions.',
    features: [
      'Full-length interviews with adaptive difficulty',
      'Advanced analytics & personalised insights',
      'Practice daily across industries and roles',
    ],
    cta: 'Begin Accelerator',
    badge: 'Most Popular · Chosen by Professionals',
    recommended: true,
  },
  {
    id: '30d',
    name: '30-Day Development Pass',
    tagline: 'Consistent improvement',
    price: 'A$99.99',
    duration: '30 Days',
    description:
      'For candidates committed to consistent, measurable improvement.',
    features: [
      'Deep-dive simulations across all interview stages',
      'Track skill progression over time',
      'Access to both text and voice simulations',
    ],
    cta: 'Start Development Plan',
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    tagline: 'Ongoing advantage',
    price: 'A$199.99',
    duration: 'Forever',
    description:
      'For professionals who treat preparation as an ongoing advantage.',
    features: [
      'Unlimited interviews, forever',
      'Lifetime access to evolving AI models & analytics',
      'Priority feedback and early access to new features',
    ],
    cta: 'Unlock Lifetime Access',
    badge: 'Best Value',
  },
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
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent"
          >
            Select Your Interview Access Pass
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto"
          >
            Unlimited AI interviews, full performance reports, voice & text
            modes.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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

              <div className="p-8">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {tier.tagline}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {tier.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{tier.duration}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 leading-relaxed mb-6 min-h-[3rem]">
                  {tier.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <span className="text-sm text-slate-700 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

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
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-slate-500 font-medium">
            Immediate access · One-time payment · No subscriptions or renewals
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
