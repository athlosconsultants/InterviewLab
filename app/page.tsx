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
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 pt-32 pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Try a Real Interview Question Now
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              No signup required. Instant feedback.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                <span>10,000+ real interviews</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-500" />
                <span>2,847 practiced this week</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-500" />
                <span>50+ industries</span>
              </div>
            </div>
          </div>

          {/* QuickTry Widget */}
          <div className="mt-12">
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
                      className="text-lg px-8 py-6 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                    >
                      Start Premium Interview ({passType})
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/assessment/setup">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6 border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                    >
                      Try Free Assessment
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/assessment/setup">
                    <Button
                      size="lg"
                      className="text-lg px-8 py-6 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                    >
                      Start My Free 3-Question Assessment →
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6 border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50"
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

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three steps to interview mastery
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes with our streamlined process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:border-cyan-400 transition-all duration-300">
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Upload</h3>
                <p className="text-muted-foreground">
                  Share your CV and the job description. Supports PDF, images,
                  and text.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:border-cyan-400 transition-all duration-300">
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Research</h3>
                <p className="text-muted-foreground">
                  Our AI researches the company, analyzes your background, and
                  crafts personalized questions.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:border-cyan-400 transition-all duration-300">
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Interview</h3>
                <p className="text-muted-foreground">
                  Practice with voice or text mode. Get real-time feedback and
                  detailed performance reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-cyan-400/15 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for serious candidates
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional features that mirror real interview conditions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 - Voice Mode */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Voice Mode</h3>
              <p className="text-muted-foreground">
                Practice speaking naturally with AI-powered voice interviews.
                Realistic TTS reads questions aloud, and voice recognition
                captures your answers.
              </p>
            </div>

            {/* Feature 2 - Text Mode */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Type className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Text Mode</h3>
              <p className="text-muted-foreground">
                Perfect for practicing written communication. Type thoughtful
                responses and get detailed feedback on structure and content.
              </p>
            </div>

            {/* Feature 3 - Adaptive Difficulty */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Adaptive Difficulty</h3>
              <p className="text-muted-foreground">
                Questions adjust in real-time based on your performance. Strong
                answers unlock harder questions, just like real interviews.
              </p>
            </div>

            {/* Feature 4 - Multi-Stage */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Multi-Stage Interviews</h3>
              <p className="text-muted-foreground">
                Simulate complete interview processes with up to 3 stages.
                Technical, behavioral, and case questions all in one session.
              </p>
            </div>

            {/* Feature 5 - Smart Research */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Smart Research</h3>
              <p className="text-muted-foreground">
                AI analyzes job descriptions and company data to generate
                questions that match the actual role and company culture.
              </p>
            </div>

            {/* Feature 6 - Detailed Reports */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Detailed Reports</h3>
              <p className="text-muted-foreground">
                Get comprehensive feedback on communication, problem-solving,
                and domain knowledge with actionable improvement suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by job seekers everywhere
            </h2>
            <p className="text-lg text-muted-foreground">
              Real feedback from candidates who landed their dream jobs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="flex gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground italic">
                &ldquo;The voice mode is incredible. It felt just like my actual
                Google interview. The adaptive difficulty really pushed me to
                improve.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src="/Sarah_Chen Headshot.png"
                  alt="Sarah Chen"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Sarah Chen</p>
                  <p className="text-sm text-muted-foreground">
                    Software Engineer at Google
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="flex gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground italic">
                &ldquo;Best interview prep tool I&apos;ve used. The AI generates
                questions specific to the actual job posting. Got offers from 3
                out of 4 companies!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src="/Marcus_Johnson Headshot.png"
                  alt="Marcus Johnson"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Marcus Johnson</p>
                  <p className="text-sm text-muted-foreground">
                    Product Manager at Amazon
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-4">
              <div className="flex gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground italic">
                &ldquo;The detailed feedback helped me identify exactly where I
                was weak. Within 2 weeks of practice, I aced my Meta
                interview.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src="/Priya_Patel Headshot.png"
                  alt="Priya Patel"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Priya Patel</p>
                  <p className="text-sm text-muted-foreground">
                    Data Scientist at Meta
                  </p>
                </div>
              </div>
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
              Ready to ace your next interview?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of candidates who have improved their interview
              skills and landed offers at top companies.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/assessment/setup">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  Start your free interview today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Get started in 2 minutes
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
