'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

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
    name: 'The Weekend Warrior',
    price: 'A$29.99',
    cta: 'Get Interview-Ready',
  },
  {
    id: '7d',
    label: '7 Days',
    name: 'The Standard Prep',
    price: 'A$59.99',
    cta: 'Start Practicing',
    badge: 'Most Popular',
  },
  {
    id: '30d',
    label: '30 Days',
    name: 'The Career Investment',
    price: 'A$99.99',
    cta: 'Begin Training',
  },
];

const SHARED_FEATURES = [
  'Practice until natural - unlimited sessions',
  'AI trained on 10k+ S&P 500 interviews tells you exactly what to fix',
  'Voice or text - feels like the real thing',
  'Gets harder as you improve',
  'Tech, finance, consulting, marketing, healthcare - all covered',
  'Track improvement in real-time',
];

const SHARED_FEATURES_DESKTOP = [
  'Practice until it feels natural - no limits, no counting',
  'AI trained on 10,000+ real S&P 500 interviews identifies exactly what to fix',
  'Realistic voice interviews (or text if you prefer) - feels like the real thing',
  'Questions that match your skill level - gets harder as you improve',
  'Tech, finance, consulting, marketing, healthcare - every industry covered',
  'Track your improvement in real-time - see your confidence score rising',
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1], // Custom ease-out curve
        }}
        className="flex flex-col gap-6 rounded-3xl border-2 border-slate-200 bg-white shadow-xl p-6 max-w-md mx-auto lg:hidden"
      >
        {/* Header */}
        <div className="text-center">
          {/* Pre-headline */}
          <p className="text-xs text-slate-500 mb-2 font-medium">
            AI trained on 10k+ S&P 500 interviews
          </p>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent mb-2">
            Get Interview-Ready Fast
          </h2>
          <p className="text-sm text-slate-600">
            One payment. No subscription. Start in 60 sec.
          </p>
        </div>

        {/* Super Tab Container - Time-based Plans */}
        <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-blue-50/50 to-blue-50 p-5">
          {/* Most Popular Badge - Only show when 7d selected */}
          {selectedPlan === '7d' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="flex justify-center mb-4"
            >
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] text-white text-xs font-semibold rounded-full shadow-md">
                Most Popular
              </span>
            </motion.div>
          )}

          {/* Inner Tab Pills */}
          <div className="flex gap-2 mb-5 bg-white/60 backdrop-blur-sm rounded-xl p-1.5 border border-blue-100">
            {TEMP_PLANS.map((plan) => (
              <motion.button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                whileTap={{ scale: 0.96 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className={`flex-1 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all duration-300 ease-out ${
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
              </motion.button>
            ))}
          </div>

          {/* Active Plan Content */}
          <motion.div
            key={selectedPlan}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {/* Duration */}
            <div className="flex items-center justify-center gap-2 mb-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <p className="text-xs uppercase tracking-wide font-semibold">
                {currentPlan.label}
              </p>
            </div>

            {/* Plan Name */}
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
              {currentPlan.name}
            </h3>

            {/* Plan-specific headline */}
            <p className="text-sm font-semibold text-slate-700 mb-2 text-center">
              {selectedPlan === '48h' && "Interview in 48hrs? We've got you."}
              {selectedPlan === '7d' &&
                'The proven path to interview confidence'}
              {selectedPlan === '30d' && 'Transform from nervous to natural'}
            </p>

            {/* Plan-specific description */}
            <p className="text-xs text-slate-600 mb-3 text-center leading-relaxed">
              {selectedPlan === '48h' &&
                "Unlimited practice for the weekend. 4-6 sessions and you're ready. Text or voice."}
              {selectedPlan === '7d' &&
                "One week unlimited. Master answers, eliminate 'ums', nail tough questions."}
              {selectedPlan === '30d' &&
                'Full month to practice every question type, industry, scenario. Track progress.'}
            </p>

            {/* Price */}
            <div className="mb-2 text-center">
              <span className="text-5xl font-extrabold text-slate-900">
                {currentPlan.price}
              </span>
              <div className="text-xs text-slate-500 mt-1">
                {selectedPlan === '48h' && '48 hours access'}
                {selectedPlan === '7d' && '7 days access | A$8.57/day'}
                {selectedPlan === '30d' && '30 days unlimited | A$3.33/day'}
              </div>
            </div>

            {/* Below price stats */}
            <p className="text-xs text-center text-slate-600 mb-4 font-medium">
              {selectedPlan === '48h' && '4-6 sessions = confident'}
              {selectedPlan === '7d' && 'Avg: 8 practice interviews'}
              {selectedPlan === '30d' &&
                'Best for career changes & senior roles'}
            </p>

            {/* CTA */}
            <Button
              onClick={() => handlePurchase(currentPlan.id)}
              disabled={loading !== null}
              size="lg"
              className="w-full mb-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            y: -6,
            scale: 1.02,
            transition: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-white to-blue-50/50 p-6 text-center shadow-md hover:shadow-xl transition-shadow duration-300"
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

          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent mb-2">
            Lifetime Access
          </h3>

          <p className="text-sm font-semibold text-slate-700 mb-2">
            Never pay for interview prep again
          </p>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Unlimited forever. Every promotion, job change, career pivot.
          </p>

          <div className="mb-1">
            <span className="text-5xl font-extrabold text-slate-900">
              A$199.99
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            unlimited forever | Save A$60
          </p>
          <p className="text-xs text-slate-600 mb-4 font-medium">
            50+ industries covered
          </p>

          <Button
            onClick={() => handlePurchase('lifetime')}
            disabled={loading !== null}
            size="lg"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {loading === 'lifetime' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Buy Once, Forever'
            )}
          </Button>
        </motion.div>

        {/* FAQ - Mobile */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 text-center mb-4">
            Common Questions
          </h3>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-900 mb-1">
                Q: Can&apos;t I just practice with friends?
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                A: Will they catch your STAR format mistakes? Ask real company
                questions? Track your &apos;um&apos; count? Probably not.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-900 mb-1">
                Q: Is AI as good as human feedback?
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                A: Our AI trained on 10k+ Google, Microsoft, Goldman interviews.
                More patterns than any human coach could see.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-900 mb-1">
                Q: What if it doesn&apos;t work?
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                A: Not confident after 3 sessions? Email for refund.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Block - Mobile (repositioned below FAQ) */}
        <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 shadow-sm mt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">
            Just try it already.
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-4 text-center">
            You&apos;ve read enough. Try the free 3-question assessment. See if
            it helps. Then decide.
            <br />
            <br />5 minutes. No credit card.
          </p>
          <Link href="/assessment/setup">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Start Free Assessment
            </Button>
          </Link>
        </div>

        <p className="text-xs text-center text-slate-500 mt-6">
          All plans include full access to every feature during your selected
          timeframe
        </p>
        <p className="text-xs text-center text-slate-400 mt-4">
          By purchasing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-slate-600">
            Terms & Conditions
          </Link>
          .
        </p>
      </motion.section>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Plans Section - White background (desktop only) */}
        <div className="bg-white">
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-12"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <p className="text-sm text-slate-500 mb-2 font-medium">
                AI trained on 10,000+ real interviews from Google, Meta, Amazon,
                Goldman Sachs, McKinsey
              </p>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent mb-3">
                Get Interview-Ready Fast
              </h2>
              <p className="text-lg text-slate-600">
                One payment. No subscription. Start practicing in 60 seconds.
              </p>
            </div>

            {/* Desktop Card Grid */}
            <div className="grid grid-cols-4 gap-6 mb-12">
              {/* Time-based Plans */}
              {TEMP_PLANS.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.1 + index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                    transition: {
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    },
                  }}
                  whileTap={{ scale: 0.98 }}
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
                  <h3 className="text-xl font-bold text-center mb-2 text-slate-900">
                    {plan.name}
                  </h3>

                  {/* Plan-specific headline - Desktop */}
                  <p className="text-sm font-semibold text-slate-700 mb-2 text-center">
                    {plan.id === '48h' &&
                      "Interview in 48 hours? We've got you."}
                    {plan.id === '7d' &&
                      'The proven path to interview confidence'}
                    {plan.id === '30d' && 'Transform from nervous to natural'}
                  </p>

                  {/* Plan-specific description - Desktop */}
                  <p className="text-xs text-slate-600 mb-3 text-center leading-relaxed min-h-[48px]">
                    {plan.id === '48h' &&
                      'Unlimited practice for the weekend. Most people do 4-6 sessions and feel ready. Text or voice mode. Get the reps you need before Monday.'}
                    {plan.id === '7d' &&
                      "One week of unlimited practice. Master your answers, eliminate your 'ums,' nail the tough questions."}
                    {plan.id === '30d' &&
                      'A full month to practice every question type, every industry, every scenario. Track your progress. Watch yourself improve.'}
                  </p>

                  {/* Price */}
                  <div className="text-center mb-3">
                    <div className="text-4xl font-bold text-slate-900 mb-1">
                      {plan.price}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {plan.id === '48h' && '48 hours of full access'}
                      {plan.id === '7d' &&
                        "7 days of full access | That's A$8.57/day - less than two coffees"}
                      {plan.id === '30d' &&
                        '30 days unlimited | Just A$3.33/day for a month'}
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      {plan.id === '48h' &&
                        'Most users practice 4-6 times and feel confident'}
                      {plan.id === '7d' &&
                        'Average user completes 8 practice interviews'}
                      {plan.id === '30d' &&
                        'Best for career changers and senior roles'}
                    </p>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(plan.id);
                    }}
                    disabled={loading !== null}
                    size="lg"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
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
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.34,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }}
                whileTap={{ scale: 0.98 }}
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
                <h3 className="text-xl font-bold text-center mb-2 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent">
                  Lifetime Access
                </h3>

                <p className="text-sm font-semibold text-slate-700 mb-2 text-center">
                  Never pay for interview prep again
                </p>

                <p className="text-xs text-slate-600 mb-3 text-center leading-relaxed min-h-[48px]">
                  Unlimited practice forever. Every promotion, every job change,
                  every career pivot. One payment covers your entire career.
                </p>

                {/* Price */}
                <div className="text-center mb-3">
                  <div className="text-4xl font-bold text-slate-900 mb-1">
                    A$199.99
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    unlimited forever | Save A$60+ vs buying 30-day passes twice
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    Used by professionals across 50+ industries
                  </p>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handlePurchase('lifetime')}
                  disabled={loading !== null}
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {loading === 'lifetime' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Buy Once, Forever'
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Features Section - Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg p-10"
            >
              <h4 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                Every Plan Includes
              </h4>
              <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                {SHARED_FEATURES_DESKTOP.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + i * 0.04,
                      ease: [0.4, 0, 0.2, 1],
                    }}
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
          </motion.section>
        </div>

        {/* FAQ Section - Slate background (desktop only) */}
        <div className="bg-slate-50 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-4xl mx-auto px-4 md:px-6"
          >
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
              Common Questions
            </h3>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6">
                <p className="text-base font-semibold text-slate-900 mb-2">
                  Q: &quot;But I can practice with friends for free?&quot;
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  A: Sure. But will they tell you exactly why your answer to
                  &apos;Tell me about a time you failed&apos; isn&apos;t STAR
                  format? Will they ask you questions that ACTUAL companies ask?
                  Will they track your &apos;um&apos; count?
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6">
                <p className="text-base font-semibold text-slate-900 mb-2">
                  Q: &quot;Is AI feedback as good as human feedback?&quot;
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  A: Our AI is trained on 10,000+ real interviews from Google,
                  Microsoft, Goldman Sachs, McKinsey and 496 other S&P 500
                  companies. It&apos;s analyzed more interview patterns than any
                  human coach could in a lifetime.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6">
                <p className="text-base font-semibold text-slate-900 mb-2">
                  Q: &quot;What if it doesn&apos;t work for me?&quot;
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  A: If you&apos;re not more confident after your first 3
                  practice interviews, email us and we&apos;ll refund you.
                  Simple.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section - Light blue gradient background */}
        <div className="bg-gradient-to-b from-white via-cyan-50/30 to-blue-50/40 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-2xl mx-auto px-4 md:px-6"
          >
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200 shadow-lg p-10">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">
                  Still reading? Just try it.
                </h3>
                <p className="text-base text-slate-700 leading-relaxed">
                  Look, you&apos;ve scrolled this far. You&apos;re clearly
                  interested.
                  <br />
                  <br />
                  Start with the free 3-question assessment. See if the feedback
                  actually helps. Then decide if you want unlimited access.
                  <br />
                  <br />
                  Worst case? You spend 5 minutes. Best case? You nail your next
                  interview.
                </p>
                <div className="pt-4">
                  <Link href="/assessment/setup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      Start Free Assessment
                    </Button>
                  </Link>
                  <p className="text-sm text-slate-600 mt-3">
                    Takes 5 minutes, no credit card
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-center text-slate-500 mt-12 px-4 md:px-6">
              All plans include full access to every feature during your
              selected timeframe
            </p>
            <p className="text-xs text-center text-slate-400 mt-4">
              By purchasing, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-slate-600">
                Terms & Conditions
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
