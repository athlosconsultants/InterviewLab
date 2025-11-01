'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Mic,
  Brain,
  Target,
  Zap,
  ArrowRight,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase-client';
import { QuickTryWidget } from '@/components/landing/QuickTryWidget';

/**
 * Mobile Landing Page - Updated with Rory's feedback
 * Conversion-optimized for TikTok and Instagram traffic
 */
export default function MobileLandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const ctaHref = isAuthenticated ? '/assessment/setup' : '/sign-in';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white pb-24">
      {/* Hero Section - Mobile Optimized with Background */}
      <section className="relative overflow-hidden min-h-[60vh] px-6 pt-12 pb-8">
        {/* Background Image Layer - Mobile optimized with zoom */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute inset-0 scale-110">
            <img
              src="/Images/hero-bg.jpg"
              alt=""
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>

          {/* Translucent Gradient Overlay - Shows background image while maintaining readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(224, 242, 254, 0.45) 0%, rgba(186, 230, 253, 0.50) 50%, rgba(224, 242, 254, 0.55) 100%)',
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold leading-tight mb-3 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,1)]">
              Try a Real Interview Question Now
            </h1>
            <p className="text-base text-gray-800 font-semibold drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
              No signup. Instant feedback.
            </p>
          </div>

          {/* Trust badges - Individual backgrounds for readability */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-xs text-gray-800">
            <div className="flex items-center gap-1 bg-white/85 px-4 py-2 rounded-lg backdrop-blur-sm drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
              <CheckCircle2 className="w-3 h-3 text-cyan-600 drop-shadow-[0_0_6px_rgba(255,255,255,1)]" />
              <span className="font-semibold">
                AI trained on 10,000+ interviews
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white/85 px-4 py-2 rounded-lg backdrop-blur-sm drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
              <Briefcase className="w-3 h-3 text-cyan-600 drop-shadow-[0_0_6px_rgba(255,255,255,1)]" />
              <span className="font-semibold">50+ industries</span>
            </div>
          </div>

          {/* QuickTry Widget */}
          <div className="mb-8">
            <QuickTryWidget />
          </div>

          {/* CTA Below Widget */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
              Want more?
            </h2>
            <p className="text-sm text-gray-700 font-semibold mb-4 drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
              Full assessment + detailed feedback
            </p>
            <Button
              asChild
              size="lg"
              disabled={isLoading}
              className="w-full border-2 border-cyan-600"
            >
              <Link
                href={ctaHref}
                className="flex items-center justify-center gap-2"
              >
                {isLoading
                  ? 'Loading...'
                  : 'Start Free 3-Question Assessment →'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why This Works - Weak vs Strong */}
      <section className="px-6 pb-8 pt-8 bg-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            See What You&apos;re Missing
          </h2>
          <p className="text-sm text-gray-600">
            Most people don&apos;t realize these mistakes
          </p>
        </div>

        <div className="space-y-4">
          {/* Weak Answer */}
          <div className="bg-white rounded-xl p-5 border-2 border-red-200">
            <div className="mb-3">
              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                ❌ WEAK
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              &quot;Tell me about a time you failed.&quot;
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-700">
                I&apos;m a hard worker. I&apos;m passionate. I give 110% and
                I&apos;m a team player.
              </p>
            </div>
            <ul className="space-y-1 text-xs text-red-600">
              <li>❌ No specific example</li>
              <li>❌ Generic clichés</li>
              <li>❌ No results</li>
            </ul>
          </div>

          {/* Strong Answer */}
          <div className="bg-white rounded-xl p-5 border-2 border-green-200">
            <div className="mb-3">
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                ✅ STRONG
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              &quot;Tell me about a time you failed.&quot;
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-700">
                At my last internship, I missed a deadline by two weeks. I told
                my manager immediately, we redistributed tasks, and I stayed
                late. We launched only 3 days late, and I learned to build in
                20% buffer time.
              </p>
            </div>
            <ul className="space-y-1 text-xs text-green-600">
              <li>✅ Clear situation</li>
              <li>✅ Specific actions</li>
              <li>✅ Quantified result (3 days vs 14)</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/assessment/setup">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              See What Your Answers Are Missing →
            </Button>
          </Link>
        </div>
      </section>

      {/* What You Get - Free vs Premium */}
      <section className="px-6 pb-8 bg-slate-50 -mx-6 py-8">
        <div className="px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">What You Get</h2>
            <p className="text-sm text-gray-600">Start free, upgrade later</p>
          </div>

          <div className="space-y-4">
            {/* Free */}
            <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
              <h3 className="text-lg font-bold mb-1">Free Assessment</h3>
              <p className="text-xs text-gray-600 mb-4">Try it now</p>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span>3 behavioral questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span>Feedback on 1 category</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span>Text-only mode</span>
                </li>
              </ul>
              <Button variant="outline" size="default" className="w-full">
                <Link href="/assessment/setup">Try Free</Link>
              </Button>
            </div>

            {/* Premium Super Card */}
            <div className="bg-white rounded-xl p-5 border-2 border-cyan-500 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-full">
                  POPULAR
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1 mt-2">Premium</h3>
              <p className="text-xs text-gray-600 mb-4">Full simulation</p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">
                    What You Get:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span>Unlimited questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span>Full AI feedback (3 categories)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span>Voice mode (like Zoom)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span>Personalized to your CV</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">
                    Why Upgrade:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Mic className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">
                          Practice Speaking
                        </p>
                        <p className="text-xs text-gray-600">
                          Voice = think on your feet
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">
                          Specific Feedback
                        </p>
                        <p className="text-xs text-gray-600">
                          See exactly what to fix
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">Real Conditions</p>
                        <p className="text-xs text-gray-600">
                          Multi-stage = actual format
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <Button
                size="default"
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="px-6 pb-8 pt-8 bg-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Common Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold mb-1 text-gray-900">
              Is the free version really free?
            </h3>
            <p className="text-xs text-gray-700">
              Yes. No card. 3 questions + feedback. Upgrade if you want more.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold mb-1 text-gray-900">
              Better than practicing with a friend?
            </h3>
            <p className="text-xs text-gray-700">
              Friends won&apos;t tell you your answer was vague. AI will.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold mb-1 text-gray-900">
              Does AI know my company?
            </h3>
            <p className="text-xs text-gray-700">
              If it&apos;s S&P 500 or well-known, yes. Questions match what they
              actually ask.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold mb-1 text-gray-900">
              What if I mess up?
            </h3>
            <p className="text-xs text-gray-700">
              That&apos;s the point. Mess up here, not in the real interview.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-8 pt-8 bg-slate-50">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200 text-center">
          <h2 className="text-2xl font-bold mb-3">
            One bad interview = lost offer
          </h2>
          <p className="text-sm text-gray-700 mb-6">
            Don&apos;t find out what&apos;s wrong in the actual interview. Find
            out now, free.
          </p>
          <Button
            size="lg"
            className="w-full mb-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <Link href="/assessment/setup">Try Free Assessment →</Link>
          </Button>
          <p className="text-xs text-gray-600">
            No card • 3 questions • Instant feedback
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
