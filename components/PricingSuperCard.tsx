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
    <>
      {/* Mobile Layout */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6 rounded-3xl border-2 border-slate-200 bg-white shadow-xl p-6 max-w-md mx-auto lg:hidden"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent mb-2">
            Choose Your Access
          </h2>
          <p className="text-sm text-slate-600">
            One-time payment · Immediate access
          </p>
        </div>

        {/* Super Tab Container - Time-based Plans */}
        <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-blue-50/50 to-blue-50 p-5">
          {/* Most Popular Badge - Only show when 7d selected */}
          {selectedPlan === '7d' && (
            <div className="flex justify-center mb-4">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-xs font-semibold rounded-full shadow-md">
                Most Popular
              </span>
            </div>
          )}

          {/* Inner Tab Pills */}
          <div className="flex gap-2 mb-5 bg-white/60 backdrop-blur-sm rounded-xl p-1.5 border border-blue-100">
            {TEMP_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`flex-1 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white shadow-lg'
                    : 'bg-transparent text-slate-600 hover:bg-white/50'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{plan.label}</div>
                  <div className="text-[10px] opacity-90 mt-0.5">
                    {plan.price}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Plan Content */}
          <motion.div
            key={selectedPlan}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Duration */}
            <div className="flex items-center justify-center gap-2 mb-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <p className="text-xs uppercase tracking-wide font-semibold">
                {currentPlan.label}
              </p>
            </div>

            {/* Plan Name */}
            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">
              {currentPlan.name}
            </h3>

            {/* Price */}
            <div className="mb-4 text-center">
              <span className="text-5xl font-extrabold text-slate-900">
                {currentPlan.price}
              </span>
              <span className="text-sm text-slate-500 ml-2">one-time</span>
            </div>

            {/* CTA */}
            <Button
              onClick={() => handlePurchase(currentPlan.id)}
              disabled={loading !== null}
              className="w-full rounded-xl bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-12 mb-6"
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

            {/* Every Plan Includes - Inside the card */}
            <div className="pt-4 border-t-2 border-blue-100">
              <h4 className="text-base font-bold mb-3 text-slate-900 text-center">
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
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Or
          </span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Lifetime Access */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-white to-blue-50/50 p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-xs font-semibold rounded-full shadow-md">
              Best Value
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2 text-slate-600">
            <Clock className="w-4 h-4" />
            <p className="text-sm uppercase tracking-wide font-semibold">
              Forever
            </p>
          </div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent mb-3">
            Lifetime Access
          </h3>

          <div className="mb-2">
            <span className="text-5xl font-extrabold text-slate-900">
              A$199.99
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            One-time payment · Never expires
          </p>

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

        <p className="text-xs text-center text-slate-500 mt-2">
          All plans include full access to every feature
        </p>
      </motion.section>

      {/* Desktop Layout */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:block max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent mb-3">
            Choose Your Access
          </h2>
          <p className="text-lg text-slate-600">
            One-time payment · Immediate access
          </p>
        </div>

        {/* Desktop Card Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {/* Time-based Plans */}
          {TEMP_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.03 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'border-[#3E8BFF] bg-gradient-to-b from-blue-50/50 to-white shadow-2xl shadow-[#3E8BFF]/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-xs font-semibold rounded-full shadow-md whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Duration */}
              <div className="flex items-center justify-center gap-2 mb-3 text-slate-600">
                <Clock className="w-4 h-4" />
                <p className="text-xs uppercase tracking-wide font-semibold">
                  {plan.label}
                </p>
              </div>

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-center mb-4 text-slate-900">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  {plan.price}
                </div>
                <p className="text-xs text-slate-500">one-time</p>
              </div>

              {/* CTA */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(plan.id);
                }}
                disabled={loading !== null}
                className={`w-full rounded-xl py-3 font-semibold transition-all duration-300 h-11 ${
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white shadow-lg hover:shadow-xl'
                    : 'bg-white border-2 border-[#3E8BFF] text-[#3E8BFF] hover:bg-gradient-to-r hover:from-[#3E8BFF]/10 hover:to-[#3DCBFF]/10'
                }`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.cta
                )}
              </Button>
            </motion.div>
          ))}

          {/* Lifetime Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -8, scale: 1.03 }}
            className="relative rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-white to-blue-50/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-xs font-semibold rounded-full shadow-md">
                Best Value
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-center gap-2 mb-3 text-slate-600">
              <Clock className="w-4 h-4" />
              <p className="text-xs uppercase tracking-wide font-semibold">
                Forever
              </p>
            </div>

            {/* Plan Name */}
            <h3 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent">
              Lifetime Access
            </h3>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-slate-900 mb-1">
                A$199.99
              </div>
              <p className="text-xs text-slate-500">one-time</p>
            </div>

            {/* CTA */}
            <Button
              onClick={() => handlePurchase('lifetime')}
              disabled={loading !== null}
              className="w-full rounded-xl border-2 border-[#3E8BFF] bg-white text-[#3E8BFF] font-semibold py-3 hover:bg-gradient-to-r hover:from-[#3E8BFF]/10 hover:to-[#3DCBFF]/10 transition-all duration-300 h-11"
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
        </div>

        {/* Features Section - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg p-10"
        >
          <h4 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Every Plan Includes
          </h4>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            {SHARED_FEATURES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 h-5 w-5 rounded-full bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </span>
                <span className="text-slate-700 font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="text-sm text-center text-slate-500 mt-8">
          All plans provide full access to every feature during your selected
          timeframe
        </p>
      </motion.section>
    </>
  );
}
