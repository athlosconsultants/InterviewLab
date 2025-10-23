'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type TempPlan = '48h' | '7d' | '30d';

interface PlanConfig {
  id: TempPlan;
  label: string;
  name: string;
  price: string;
  cta: string;
  badge?: string;
}

const TEMP_PLANS: PlanConfig[] = [
  {
    id: '48h',
    label: '2 Days',
    name: '48-Hour Intensive',
    price: 'A$29.99',
    cta: 'Start Intensive',
  },
  {
    id: '7d',
    label: '7 Days',
    name: '7-Day Accelerator',
    price: 'A$59.99',
    cta: 'Begin Accelerator',
    badge: 'Most Popular',
  },
  {
    id: '30d',
    label: '30 Days',
    name: '30-Day Development',
    price: 'A$99.99',
    cta: 'Start Development',
  },
];

const SHARED_FEATURES = [
  'Unlimited interview sessions',
  'Comprehensive AI feedback reports',
  'Voice & text interaction modes',
  'Adaptive difficulty across all stages',
  'Multi-industry role coverage',
  'Performance tracking & analytics',
];

export default function PricingSuperCard() {
  const [selectedPlan, setSelectedPlan] = useState<TempPlan>('7d');
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = TEMP_PLANS.find((p) => p.id === selectedPlan)!;

  const handlePurchase = async (tier: TempPlan | 'lifetime') => {
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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6 rounded-3xl border-2 border-slate-200 bg-white shadow-xl p-6 md:p-8 max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent mb-2">
          Choose Your Access
        </h2>
        <p className="text-sm text-slate-600">
          One-time payment · Immediate access
        </p>
      </div>

      {/* Plan Selector Pills */}
      <div className="flex justify-center gap-2 mt-2">
        {TEMP_PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedPlan === plan.id
                ? 'bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white shadow-lg scale-105'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {plan.badge && selectedPlan !== plan.id && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-[9px] font-bold rounded-full whitespace-nowrap shadow-md">
                {plan.badge}
              </span>
            )}
            <div className="flex flex-col items-center">
              <span>{plan.label}</span>
              <span className="text-xs opacity-90 mt-0.5">{plan.price}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active Temporary Plan Card */}
      <motion.div
        key={selectedPlan}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-2 text-center rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-blue-50/50 to-blue-50 p-6"
      >
        {/* Badge if applicable */}
        {currentPlan.badge && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-xs font-semibold rounded-full shadow-md">
              {currentPlan.badge}
            </span>
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center justify-center gap-2 mb-2 text-slate-600">
          <Clock className="w-4 h-4" />
          <p className="text-sm uppercase tracking-wide font-semibold">
            {currentPlan.label}
          </p>
        </div>

        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          {currentPlan.name}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <span className="text-5xl font-extrabold text-slate-900">
            {currentPlan.price}
          </span>
          <span className="text-sm text-slate-500 ml-2">one-time</span>
        </div>

        {/* CTA */}
        <Button
          onClick={() => handlePurchase(currentPlan.id)}
          disabled={loading !== null}
          className="w-full rounded-xl bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-12"
        >
          {loading === currentPlan.id ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            currentPlan.cta
          )}
        </Button>

        {/* Every Plan Includes - Integrated */}
        <div className="mt-6 pt-6 border-t-2 border-blue-100 text-left">
          <h4 className="text-base font-bold mb-4 text-slate-900 text-center">
            Every Plan Includes
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-700">
            {SHARED_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-slate-200"></div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Or
        </span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* Lifetime Access (Price Anchor) */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-white to-blue-50/50 p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        {/* Badge */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-xs font-semibold rounded-full shadow-md">
            Best Value
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-center gap-2 mb-2 text-slate-600">
          <Clock className="w-4 h-4" />
          <p className="text-sm uppercase tracking-wide font-semibold">
            Forever
          </p>
        </div>

        {/* Plan Name */}
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent mb-3">
          Lifetime Access
        </h3>

        {/* Price */}
        <div className="mb-2">
          <span className="text-5xl font-extrabold text-slate-900">
            A$199.99
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          One-time payment · Never expires
        </p>

        {/* CTA */}
        <Button
          onClick={() => handlePurchase('lifetime')}
          disabled={loading !== null}
          className="w-full rounded-xl border-2 border-[#3E8BFF] bg-white text-[#3E8BFF] font-semibold py-3 hover:bg-gradient-to-r hover:from-[#3E8BFF]/10 hover:to-[#3DCBFF]/10 transition-all duration-300 h-12"
        >
          {loading === 'lifetime' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Unlock Lifetime'
          )}
        </Button>
      </motion.div>

      {/* Bottom Reassurance */}
      <p className="text-xs text-center text-slate-500 mt-2">
        All plans include full access to every feature
      </p>
    </motion.section>
  );
}
