'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, Zap, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PremiumLandingViewProps {
  tier: string;
  expiresAt: string | null;
  isSuperAdmin?: boolean;
}

/**
 * Premium user landing view
 * Shows time remaining, motivational prompts, and direct access to premium interviews
 * Replaces the default landing page for logged-in premium users
 */
export function PremiumLandingView({
  tier,
  expiresAt,
  isSuperAdmin = false,
}: PremiumLandingViewProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!expiresAt || isSuperAdmin) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days} day${days !== 1 ? 's' : ''} ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt, isSuperAdmin]);

  // Get tier display name
  const getTierDisplay = () => {
    if (isSuperAdmin) return 'Lifetime Access';
    switch (tier) {
      case '48h':
        return '2-Day Pass';
      case '7d':
        return '7-Day Pass';
      case '30d':
        return '30-Day Pass';
      case 'lifetime':
        return 'Lifetime Access';
      default:
        return 'Premium Access';
    }
  };

  // Motivational messages that rotate
  const motivationalMessages = [
    'Every practice session brings you closer to your dream job.',
    "Confidence comes from preparation. You're doing the work.",
    'The more you practice, the more natural it feels.',
    "You're investing in your future. Keep going.",
    "Great answers don't happen by accident—they're practiced.",
  ];

  const randomMessage = mounted
    ? motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ]
    : motivationalMessages[0];

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-10 md:py-16 space-y-8 md:space-y-12">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-200">
            <Zap className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-700">
              {getTierDisplay()} Active
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Your practice environment is ready. Let&apos;s make today&apos;s
            session count.
          </p>
        </div>

        {/* Time Remaining Card (if not lifetime/super admin) */}
        {!isSuperAdmin && expiresAt && (
          <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Clock className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">
                    Time Remaining on Your Pass
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">
                    {timeRemaining}
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-cyan-600 text-cyan-700 hover:bg-cyan-50"
              >
                <Link href="/pricing">Extend Access</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Motivational Quote */}
        <div className="text-center py-6">
          <p className="text-lg md:text-xl italic text-slate-700 max-w-3xl mx-auto">
            &ldquo;{randomMessage}&rdquo;
          </p>
        </div>

        {/* Primary CTA - Start Premium Interview */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 md:p-10 shadow-lg text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Ready to Practice?
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Start a personalized interview session tailored to your experience
              and target role.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl text-base md:text-lg px-8 py-6 h-auto"
          >
            <Link href="/setup">
              <Target className="mr-2 h-5 w-5" />
              Start Premium Interview
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            <span className="hidden md:inline">
              Full interview with unlimited questions, voice mode, and detailed
              feedback
            </span>
            <span className="md:hidden">
              Unlimited questions • Voice mode • Detailed feedback
            </span>
          </p>
        </div>

        {/* Quick Stats / Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-cyan-100 mx-auto mb-3 flex items-center justify-center">
              <Zap className="h-6 w-6 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Unlimited Practice
            </h3>
            <p className="text-sm text-slate-600">
              As many sessions as you need to feel confident
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Adaptive Difficulty
            </h3>
            <p className="text-sm text-slate-600">
              Questions get harder as you improve
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Detailed Feedback
            </h3>
            <p className="text-sm text-slate-600">
              Know exactly what to improve after each answer
            </p>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Link href="/assessment/setup">
              Try Quick 3-Question Assessment
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
