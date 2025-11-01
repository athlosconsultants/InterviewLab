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
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh]">
        {/* Background Image Layer - Mobile optimized positioning and scale */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 scale-110 md:scale-100">
            <Image
              src="/Images/hero-bg.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center md:object-center"
              sizes="100vw"
              quality={90}
            />
          </div>

          {/* Responsive Gradient Overlay - Stronger on mobile for readability, subtle on desktop */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(224, 242, 254, 0.92) 0%, rgba(224, 242, 254, 0.90) 25%, rgba(224, 242, 254, 0.85) 50%, rgba(224, 242, 254, 0.90) 75%, rgb(240, 249, 255) 100%)',
            }}
          />
          {/* Desktop Gradient Overlay - More subtle to show image */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                'linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 30%, rgba(224, 242, 254, 0.4) 60%, rgba(224, 242, 254, 0.7) 85%, rgb(240, 249, 255) 100%)',
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

            {/* Trust badges - Mobile: white glow, Desktop: minimal shadow */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-800 drop-shadow-[0_0_8px_rgba(255,255,255,1)] md:drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)]">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 drop-shadow-[0_0_6px_rgba(255,255,255,1)] md:drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]" />
                <span className="font-semibold">
                  AI trained on 10,000+ S&P 500 interviews
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 drop-shadow-[0_0_8px_rgba(255,255,255,1)] md:drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)]">
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
                    <Button size="lg">
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
                    <Button size="lg">
                      Start My Free 3-Question Assessment →
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline">
                      Explore Premium Plans
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why This Works Section - Weak vs Strong Comparison */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See What Most People Miss
            </h2>
            <p className="text-lg text-muted-foreground">
              Our AI catches the mistakes friends won&apos;t tell you about
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Weak Answer Column */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  ❌ WEAK ANSWER
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 mb-4">
                &quot;Tell me about a time you failed.&quot;
              </p>

              <div className="bg-slate-50 rounded-lg p-6 mb-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  I&apos;m a hard worker. I&apos;m very passionate about this
                  role. I always give 110% and I&apos;m a team player. I really
                  want this job because I think it would be a great opportunity
                  for growth.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-red-600 flex items-start gap-2">
                  <span>❌</span>
                  <span>No specific example</span>
                </p>
                <p className="text-sm text-red-600 flex items-start gap-2">
                  <span>❌</span>
                  <span>
                    Generic clichés (&quot;110%&quot;, &quot;team player&quot;)
                  </span>
                </p>
                <p className="text-sm text-red-600 flex items-start gap-2">
                  <span>❌</span>
                  <span>No measurable results</span>
                </p>
                <p className="text-sm text-red-600 flex items-start gap-2">
                  <span>❌</span>
                  <span>Doesn&apos;t actually answer the question</span>
                </p>
              </div>
            </div>

            {/* Strong Answer Column */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-200">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  ✅ STRONG ANSWER
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 mb-4">
                &quot;Tell me about a time you failed.&quot;
              </p>

              <div className="bg-slate-50 rounded-lg p-6 mb-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  At my last internship, I misestimated a project timeline by
                  two weeks, which delayed our product launch. I immediately
                  notified my manager, worked with the team to redistribute
                  tasks, and stayed late for a week to catch up. We launched
                  only 3 days behind schedule, and I learned to build in 20%
                  buffer time for estimates.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-green-600 flex items-start gap-2">
                  <span>✅</span>
                  <span>Clear situation (missed timeline)</span>
                </p>
                <p className="text-sm text-green-600 flex items-start gap-2">
                  <span>✅</span>
                  <span>Owned the mistake</span>
                </p>
                <p className="text-sm text-green-600 flex items-start gap-2">
                  <span>✅</span>
                  <span>Specific actions taken</span>
                </p>
                <p className="text-sm text-green-600 flex items-start gap-2">
                  <span>✅</span>
                  <span>Quantified outcome (3 days vs 14 days)</span>
                </p>
                <p className="text-sm text-green-600 flex items-start gap-2">
                  <span>✅</span>
                  <span>Shows learning and growth</span>
                </p>
              </div>
            </div>
          </div>

          {/* CTA below comparison */}
          <div className="text-center mt-12">
            <p className="text-lg text-slate-700 mb-6">
              See what your answers are missing
            </p>
            <Link href="/assessment/setup">
              <Button size="lg">Try Free Assessment →</Button>
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

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

            {/* Column 2 - Premium Features */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-cyan-500 space-y-6 relative">
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

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    Unlimited questions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    Full AI feedback (all 3 categories)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    Realistic voice mode (like Zoom)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    Personalized to your CV & job description
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    Multi-stage interviews (up to 3 rounds)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    Questions get harder as you improve
                  </span>
                </li>
              </ul>

              <Link href="/pricing" className="block">
                <Button size="default" className="w-full">
                  See Pricing
                </Button>
              </Link>
            </div>

            {/* Column 3 - Why People Upgrade */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Why Upgrade?</h3>
                <p className="text-sm text-slate-600">What you unlock</p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Mic className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Practice Speaking
                    </p>
                    <p className="text-xs text-slate-600">
                      Voice mode forces you to think on your feet
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Get Specific Feedback
                    </p>
                    <p className="text-xs text-slate-600">
                      See exactly what to fix in your answers
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Match Real Conditions
                    </p>
                    <p className="text-xs text-slate-600">
                      Multi-stage interviews = actual interview format
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
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

              <p className="text-xs text-slate-600 italic">
                Most people upgrade after the free assessment once they see the
                gaps in their answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Questions Section */}
      <section className="py-24">
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
      <section className="py-24 relative overflow-hidden">
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
                <Button size="lg">
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
