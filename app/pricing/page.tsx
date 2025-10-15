'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Loader2,
  Sparkles,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TIER_CONFIGS, type EntitlementTier } from '@/lib/schema';
import { toast } from 'sonner';

/**
 * T137 - Phase 13: Hormozi-style Pricing Page
 * Three-tier value-stacked pricing with clear comparison
 */
export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<EntitlementTier | null>(null);

  const handlePurchase = async (tier: EntitlementTier) => {
    setIsLoading(tier);

    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      // If unauthorized (not logged in), redirect to sign-in page
      if (response.status === 401) {
        // Store the selected tier in session storage to resume after login
        sessionStorage.setItem('pendingPurchaseTier', tier);
        // Redirect to sign-in with return URL to pricing page
        router.push('/sign-in?redirect=/pricing');
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout', {
        description:
          error instanceof Error ? error.message : 'Please try again',
      });
      setIsLoading(null);
    }
  };

  // Check for pending purchase after sign-in
  useEffect(() => {
    const pendingTier = sessionStorage.getItem('pendingPurchaseTier');
    if (
      pendingTier &&
      ['starter', 'professional', 'elite'].includes(pendingTier)
    ) {
      // Clear the pending tier
      sessionStorage.removeItem('pendingPurchaseTier');
      // Automatically trigger the purchase
      handlePurchase(pendingTier as EntitlementTier);
    }
  }, []);

  const tiers = [
    TIER_CONFIGS.starter,
    TIER_CONFIGS.professional,
    TIER_CONFIGS.elite,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Transform Your Interview Game
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            Free is for testing —{' '}
            <span className="font-semibold text-foreground">
              Premium is for transforming.
            </span>
          </p>
          <p className="text-muted-foreground">
            Unlock AI-powered interview simulation with detailed feedback
          </p>
        </motion.div>

        {/* Free Plan Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-muted/50 border rounded-xl p-6 mb-12 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold mb-1">Free Plan - Practice Mode</h3>
              <p className="text-sm text-muted-foreground">
                1 interview • 3 questions • Text-only • Basic feedback
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/setup')}>
              Try Free
            </Button>
          </div>
        </motion.div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, index) => {
            const isPopular = tier.tier === 'professional';
            const isElite = tier.tier === 'elite';

            return (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div
                  className={`h-full rounded-2xl border-2 p-8 ${
                    isPopular
                      ? 'border-primary bg-primary/5 shadow-lg scale-105'
                      : isElite
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                        : 'border-border bg-card'
                  }`}
                >
                  {/* Tier Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{tier.name}</h2>
                      {isElite && (
                        <Sparkles className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tier.description}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {tier.currency === 'USD' ? '$' : 'AU$'}
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground">one-time</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {tier.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePurchase(tier.tier)}
                    disabled={isLoading !== null}
                    className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : isElite ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                    size="lg"
                  >
                    {isLoading === tier.tier ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Get ${tier.interview_count} Interviews`
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Compare Features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold">Starter</th>
                  <th className="text-center p-4 font-semibold bg-primary/10">
                    Professional
                  </th>
                  <th className="text-center p-4 font-semibold">Elite</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: 'Interview Count',
                    free: '1 × (3 Q)',
                    starter: '3',
                    professional: '5',
                    elite: '10',
                  },
                  {
                    feature: 'Voice Mode',
                    free: false,
                    starter: true,
                    professional: true,
                    elite: true,
                  },
                  {
                    feature: 'Full Feedback Report',
                    free: 'Basic',
                    starter: true,
                    professional: true,
                    elite: true,
                  },
                  {
                    feature: 'Multi-Stage Interviews',
                    free: false,
                    starter: false,
                    professional: true,
                    elite: true,
                  },
                  {
                    feature: 'Adaptive Difficulty',
                    free: false,
                    starter: true,
                    professional: true,
                    elite: true,
                  },
                  {
                    feature: 'Advanced Analytics',
                    free: false,
                    starter: false,
                    professional: true,
                    elite: true,
                  },
                  {
                    feature: 'Priority AI Engine',
                    free: false,
                    starter: false,
                    professional: false,
                    elite: true,
                  },
                  {
                    feature: 'Confidence Score Report',
                    free: false,
                    starter: false,
                    professional: false,
                    elite: true,
                  },
                ].map((row) => (
                  <tr key={row.feature} className="border-t">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{row.free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{row.starter}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{row.professional}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.elite === 'boolean' ? (
                        row.elite ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{row.elite}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Value Props */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-8">Why InterviewLab?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Instant Start</h4>
              <p className="text-sm text-muted-foreground">
                Upload CV → Start in 60 seconds
              </p>
            </div>
            <div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Proven AI</h4>
              <p className="text-sm text-muted-foreground">
                Trained on S&P 500 company data
              </p>
            </div>
            <div>
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Real Feedback</h4>
              <p className="text-sm text-muted-foreground">
                Detailed reports with actionable tips
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground border-t pt-8">
          <p>
            Need help?{' '}
            <a
              href="mailto:support@theinterviewlab.io"
              className="text-primary hover:underline"
            >
              support@theinterviewlab.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
