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
import { PrefetchLinks } from '@/components/PrefetchLinks';

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
      {/* Prefetch critical pages for faster navigation */}
      <PrefetchLinks />

      {/* Hero Section - Mobile Optimized with Mobile-specific Background */}
      <section className="relative overflow-hidden min-h-[100svh] px-4 pt-12 pb-8">
        {/* Background Image Layer - Mobile-specific optimized images */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Mobile Background - WebP with JPG fallback */}
          <picture className="absolute inset-0 block w-full h-full">
            <source type="image/webp" srcSet="/Images/mobile-bg-v2.webp" />
            <img
              src="/Images/mobile-bg-v2.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center block"
              loading="eager"
            />
          </picture>

          {/* Translucent Gradient Overlay - Shows background image while maintaining readability */}
          <div
            className="absolute inset-0 z-10"
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
            {isLoading ? (
              <Button
                size="lg"
                disabled
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-none"
              >
                Loading...
              </Button>
            ) : (
              <Link href={ctaHref} className="block">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Start Free 3-Question Assessment →
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Why This Works - Redesigned Premium Section */}
      <section className="px-4 pb-12 pt-10 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-slate-900">
            See What You&apos;re Missing
          </h2>
          <p className="text-sm text-slate-600">
            Most answers lose points—here&apos;s why
          </p>
        </div>

        {/* Single Card with Before/After Toggle Visualization */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              &quot;Tell me about a time you failed.&quot;
            </p>
          </div>

          {/* Before (Common Mistakes) */}
          <div className="mb-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Common Answer
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-3 italic">
              &quot;I&apos;m a hard worker. I&apos;m passionate. I give 110% and
              I&apos;m a team player.&quot;
            </p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-slate-400 mt-0.5">→</span>
                <span>Misses the question entirely</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-slate-400 mt-0.5">→</span>
                <span>Generic phrases everyone uses</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-slate-400 mt-0.5">→</span>
                <span>Zero measurable outcomes</span>
              </div>
            </div>
          </div>

          {/* After (What Works) */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span className="text-xs font-bold text-cyan-700 uppercase tracking-wide">
                What Actually Works
              </span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed mb-3 font-medium">
              &quot;At my last internship, I missed a deadline by two weeks. I
              told my manager immediately, we redistributed tasks, and I stayed
              late. We launched only 3 days late, and I learned to build in 20%
              buffer time.&quot;
            </p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-xs text-cyan-700">
                <span className="text-cyan-500 mt-0.5">✓</span>
                <span className="font-medium">Clear situation & action</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-cyan-700">
                <span className="text-cyan-500 mt-0.5">✓</span>
                <span className="font-medium">
                  Specific numbers (2 weeks → 3 days)
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-cyan-700">
                <span className="text-cyan-500 mt-0.5">✓</span>
                <span className="font-medium">Shows learning & growth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Signal: Data Point */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-600">73%</p>
              <p className="text-xs text-slate-600">
                of candidates use generic phrases
              </p>
            </div>
            <div className="w-px h-12 bg-slate-300"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-600">9/10</p>
              <p className="text-xs text-slate-600">
                forget to quantify results
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/assessment/setup">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              See What Your Answers Are Missing →
            </Button>
          </Link>
        </div>
      </section>

      {/* What You Get - Free vs Premium */}
      <section className="px-4 pb-10 pt-10 bg-slate-50">
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
                      <p className="text-sm font-semibold">Practice Speaking</p>
                      <p className="text-xs text-gray-600">
                        Voice = think on your feet
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Specific Feedback</p>
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
      </section>

      {/* Common Questions */}
      <section className="px-4 pb-10 pt-10 bg-white">
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
      <section className="px-4 pb-10 pt-10 bg-slate-50">
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
