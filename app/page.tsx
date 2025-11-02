/**
 * T129/T130 - Landing Page Redesign
 * Apple-style hero with modern UX, compelling copy, and clear CTAs
 */

import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Mic,
  Type,
  Zap,
  Target,
  Brain,
  BarChart3,
  CheckCircle2,
  Users,
  Briefcase,
} from 'lucide-react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase-server';
import { QuickTryWidget } from '@/components/landing/QuickTryWidget';
import { PrefetchLinks } from '@/components/PrefetchLinks';

export const metadata: Metadata = {
  title:
    'InterviewLab - AI Interview Simulator | Practice with S&P 500 Companies',
  description:
    'Prepare for real interviews with AI trained on S&P 500 companies. Get personalized feedback, adaptive difficulty, and realistic voice or text interviews.',
  keywords: [
    'interview practice',
    'AI interview',
    'job interview simulator',
    'interview preparation',
    'mock interview',
    'career coaching',
  ],
  openGraph: {
    title: 'InterviewLab - AI Interview Simulator',
    description:
      'Prepare for real interviews with AI trained on S&P 500 companies.',
    type: 'website',
  },
};

export default async function Home() {
  // T102: Check if user is logged in and has active pass
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasActivePass = false;
  let passType: string | null = null;

  if (user) {
    // Check for active time-based pass (not credit-based)
    const { isEntitled, getUserEntitlements } = await import(
      '@/lib/entitlements'
    );
    const entitled = await isEntitled(user.id);
    if (entitled) {
      const entitlement = await getUserEntitlements(user.id);
      hasActivePass = true;
      passType = entitlement.tier;
    }
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-white via-slate-50 to-white">
      {/* Prefetch critical pages for faster navigation */}
      <PrefetchLinks />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[100svh] md:min-h-[70vh] lg:min-h-[80vh]">
        {/* Background Image Layer - Mobile-specific optimized images for mobile, desktop image for larger screens */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Mobile Background - WebP with JPG fallback */}
          <picture className="absolute inset-0 md:hidden">
            <source
              type="image/webp"
              srcSet="/Images/mobile-bg-v2.webp"
              media="(max-width: 768px)"
            />
            <img
              src="/Images/mobile-bg-v2.jpg"
              alt=""
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </picture>

          {/* Desktop Background - Original hero-bg.jpg */}
          <div className="absolute inset-0 hidden md:block">
            <Image
              src="/Images/hero-bg.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              quality={90}
            />
          </div>

          {/* Mobile Gradient Overlay - Translucent to show image while maintaining readability */}
          <div
            className="absolute inset-0 md:hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(224, 242, 254, 0.45) 0%, rgba(186, 230, 253, 0.50) 50%, rgba(224, 242, 254, 0.55) 100%)',
            }}
          />
          {/* Desktop Gradient Overlay - Very subtle to showcase image */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                'linear-gradient(180deg, rgba(224, 242, 254, 0.25) 0%, rgba(186, 230, 253, 0.30) 50%, rgba(224, 242, 254, 0.35) 100%)',
            }}
          />
        </div>

        {/* Subtle gradient orbs for depth - Desktop only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1] hidden md:block">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-[2] container mx-auto px-6 pt-32 pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Headline - Mobile: white glow for readability, Desktop: subtle shadow */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,1)] md:drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              Try a Real Interview Question Now
            </h1>

            {/* Subheadline - Mobile: strong white glow, Desktop: subtle shadow */}
            <p className="text-lg sm:text-xl text-slate-800 font-semibold max-w-2xl mx-auto drop-shadow-[0_0_10px_rgba(255,255,255,1)] md:drop-shadow-[0_2px_6px_rgba(255,255,255,0.9)]">
              No signup required. Instant feedback.
            </p>

            {/* Trust badges - Individual backgrounds for readability over image */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-800 bg-white/85 px-4 py-2 rounded-lg backdrop-blur-sm drop-shadow-[0_0_8px_rgba(255,255,255,1)] md:drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)]">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 drop-shadow-[0_0_6px_rgba(255,255,255,1)] md:drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]" />
                <span className="font-semibold">
                  AI trained on 10,000+ S&P 500 interviews
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 bg-white/85 px-4 py-2 rounded-lg backdrop-blur-sm drop-shadow-[0_0_8px_rgba(255,255,255,1)] md:drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)]">
                <Briefcase className="w-4 h-4 text-cyan-600 drop-shadow-[0_0_6px_rgba(255,255,255,1)] md:drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]" />
                <span className="font-semibold">50+ industries covered</span>
              </div>
            </div>
          </div>

          {/* QuickTry Widget - z-index: 3 - Fully opaque card */}
          <div className="mt-12 relative z-[3]">
            <QuickTryWidget />
          </div>

          {/* Social Proof / Benefits Below Widget */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Want the full experience?
              </h2>
              <p className="text-muted-foreground">
                Get your complete 3-question assessment with detailed feedback
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user && hasActivePass ? (
                <>
                  <Link href="/setup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                    >
                      Start Premium Interview ({passType})
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/assessment/setup">
                    <Button size="lg" variant="outline">
                      Try Free Assessment
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/assessment/setup">
                    <Button size="lg" variant="outline">
                      Start My Free 3-Question Assessment →
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                    >
                      Explore Premium Plans
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why This Works Section - Premium Redesign */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">
              See What Most People Miss
            </h2>
            <p className="text-lg text-slate-600">
              Most answers lose points—here&apos;s why
            </p>
          </div>

          {/* Horizontal Layout for Desktop - Side by Side Comparison */}
          <div className="max-w-7xl mx-auto">
            {/* Question Heading - Centered above columns */}
            <div className="text-center mb-8">
              <p className="text-base md:text-lg font-semibold text-slate-900">
                &quot;Tell me about a time you failed.&quot;
              </p>
            </div>

            {/* Side-by-Side Comparison - Desktop: 2 columns, Mobile/Tablet: stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {/* Left Column: Common Answer */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                    Common Answer
                  </span>
                </div>
                <p className="text-base text-slate-700 leading-relaxed mb-4 italic">
                  &quot;I&apos;m a hard worker. I&apos;m passionate. I give 110%
                  and I&apos;m a team player.&quot;
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="text-slate-400 mt-0.5">→</span>
                    <span>Misses the question entirely</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="text-slate-400 mt-0.5">→</span>
                    <span>Generic phrases everyone uses</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="text-slate-400 mt-0.5">→</span>
                    <span>Zero measurable outcomes</span>
                  </div>
                </div>
              </div>

              {/* Right Column: What Actually Works */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border-2 border-cyan-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-sm font-bold text-cyan-700 uppercase tracking-wide">
                    What Actually Works
                  </span>
                </div>
                <p className="text-base text-slate-800 leading-relaxed mb-4 font-medium">
                  &quot;At my last internship, I missed a deadline by two weeks.
                  I told my manager immediately, we redistributed tasks, and I
                  stayed late. We launched only 3 days late, and I learned to
                  build in 20% buffer time.&quot;
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-sm text-cyan-700">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span className="font-medium">
                      Clear situation & action
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-cyan-700">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span className="font-medium">
                      Specific numbers (2 weeks → 3 days)
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-cyan-700">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span className="font-medium">Shows learning & growth</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Signal: Data Point - Directly below columns */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-cyan-600 mb-1">73%</p>
                  <p className="text-sm text-slate-600">
                    of candidates use generic phrases
                  </p>
                </div>
                <div className="w-px h-16 bg-slate-300"></div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-cyan-600 mb-1">9/10</p>
                  <p className="text-sm text-slate-600">
                    forget to quantify results
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA below comparison */}
          <div className="text-center mt-12">
            <p className="text-lg text-slate-700 mb-6">
              See what your answers are missing
            </p>
            <Link href="/assessment/setup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                Try Free Assessment →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What You Get Section - Free vs Premium */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What You Actually Get
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you&apos;re ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Column 1 - Free Assessment */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Free Assessment</h3>
                <p className="text-sm text-slate-600">Try it right now</p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    3 real behavioral questions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    AI feedback on 1 category (Communication)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Text-only mode</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    See what you&apos;re missing
                  </span>
                </li>
              </ul>

              <Link href="/assessment/setup" className="block">
                <Button variant="outline" size="default" className="w-full">
                  Try Free Now
                </Button>
              </Link>
            </div>

            {/* Column 2 - Premium Super Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-cyan-500 space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <p className="text-sm text-slate-600">
                  Full interview simulation
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">
                    What You Get:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">
                        Unlimited questions
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">
                        Full AI feedback (all 3 categories)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">
                        Realistic voice mode (like Zoom)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">
                        Personalized to your CV & job description
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">
                        Multi-stage interviews (up to 3 rounds)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">
                        Questions get harder as you improve
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">
                    Why Upgrade:
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Mic className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Practice Speaking
                        </p>
                        <p className="text-xs text-slate-600">
                          Voice mode forces you to think on your feet
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Get Specific Feedback
                        </p>
                        <p className="text-xs text-slate-600">
                          See exactly what to fix in your answers
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Match Real Conditions
                        </p>
                        <p className="text-xs text-slate-600">
                          Multi-stage = actual interview format
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Adaptive Difficulty
                        </p>
                        <p className="text-xs text-slate-600">
                          Questions adjust to push your limits
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <Link href="/pricing" className="block">
                <Button
                  size="default"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  See Pricing
                </Button>
              </Link>

              <p className="text-xs text-slate-600 italic">
                Most people upgrade after the free assessment once they see the
                gaps in their answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Questions Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Common Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Question 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <h3 className="text-lg font-semibold mb-2 text-slate-900">
                Is the free version actually free?
              </h3>
              <p className="text-sm text-slate-700">
                Yes. No credit card. You get 3 questions and feedback on your
                communication skills. If you want more, you upgrade.
              </p>
            </div>

            {/* Question 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <h3 className="text-lg font-semibold mb-2 text-slate-900">
                How is this better than practicing with a friend?
              </h3>
              <p className="text-sm text-slate-700">
                Friends are nice. They won&apos;t tell you your answer was
                vague, or that you used &quot;like&quot; 14 times. Our AI will.
              </p>
            </div>

            {/* Question 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <h3 className="text-lg font-semibold mb-2 text-slate-900">
                Does the AI actually know about my company?
              </h3>
              <p className="text-sm text-slate-700">
                If it&apos;s a major company (S&P 500 or well-known startup),
                yes. The AI researches the role and generates questions that
                match what they actually ask.
              </p>
            </div>

            {/* Question 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <h3 className="text-lg font-semibold mb-2 text-slate-900">
                What if I mess up the free assessment?
              </h3>
              <p className="text-sm text-slate-700">
                That&apos;s the point. You mess up here, not in the real
                interview. You can try again in 7 days.
              </p>
            </div>

            {/* Question 5 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <h3 className="text-lg font-semibold mb-2 text-slate-900">
                How long does a full premium interview take?
              </h3>
              <p className="text-sm text-slate-700">
                Depends on how much you practice. A single-stage interview with
                8 questions takes 15-20 minutes. Multi-stage interviews can go
                longer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-12 border-2 border-cyan-200 shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              You&apos;re one bad interview away from losing an offer
            </h2>
            <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
              Don&apos;t find out what&apos;s wrong with your answers in the
              actual interview. Find out now, for free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/assessment/setup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  Try Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-600 mt-6">
              No credit card • 3 questions • Instant feedback
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
