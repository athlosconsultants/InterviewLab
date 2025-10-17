'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Zap, Target, Award, TrendingUp, ArrowRight } from 'lucide-react';
import { MobileCTA } from '@/components/marketing/MobileCTA';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase-client';

/**
 * Mobile Landing Page (Hormozi Offer Stack)
 *
 * Optimized for TikTok and mobile social traffic
 * Uses Hormozi-style copywriting with:
 * - Pain-focused headline + dream outcome
 * - Value stack with clear bullets
 * - Social proof and urgency
 * - Sticky CTA button
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

  const ctaHref = isAuthenticated ? '/setup' : '/sign-in';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-cyan-50/30 to-blue-50/50 pb-24">
      {/* Hero Section - Pain + Dream Outcome */}
      <section className="px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Ace Your Next Interview — With AI That Feels Real
        </h1>

        <p className="text-lg text-gray-600 mb-4 leading-relaxed">
          Practice immersive mock interviews built from real hiring frameworks
          used by top companies. Get instant feedback that actually improves
          your answers.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Trusted by hundreds of job seekers preparing for their next big
          opportunity.
        </p>

        {/* Main CTA Button */}
        <div className="px-6 mb-3">
          <Button
            asChild
            size="lg"
            disabled={isLoading}
            className="w-full h-14 text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl"
          >
            <Link
              href={ctaHref}
              className="flex items-center justify-center gap-2"
            >
              {isLoading ? 'Loading...' : 'Start Free Interview'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Link>
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center mb-6">
          3 questions • Text-based only • No credit card required
        </p>
      </section>

      {/* Features */}
      <section className="px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-bold text-xl text-gray-900 text-center">
              Everything You Need to Nail the Interview
            </h2>
          </div>

          {/* Value Items */}
          <div className="p-6 space-y-5">
            <FeatureItem
              icon={<Target className="w-5 h-5" />}
              title="Industry-Specific Questions"
              description="Practice with interview frameworks based on real roles at top global companies."
            />
            <FeatureItem
              icon={<Zap className="w-5 h-5" />}
              title="Instant Feedback"
              description="Get detailed analysis and improvement suggestions after every answer."
            />
            <FeatureItem
              icon={<Award className="w-5 h-5" />}
              title="Multiple Practice Modes"
              description="Switch between voice and text interviews to simulate the real thing."
            />
            <FeatureItem
              icon={<TrendingUp className="w-5 h-5" />}
              title="Track Your Progress"
              description="See measurable improvement with detailed performance insights."
            />
          </div>

          {/* CTA in card */}
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 text-center border border-cyan-100">
              <p className="text-sm font-medium text-blue-600 mb-1">
                Try your first interview free — see how you perform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 pb-8">
        <h2 className="font-bold text-xl text-gray-900 mb-4 text-center">
          How It Works
        </h2>
        <div className="space-y-3">
          <StepItem
            number={1}
            title="Upload Your Details"
            description="Add your CV, target job, and company."
          />
          <StepItem
            number={2}
            title="Start Practicing"
            description="Answer AI-generated questions tailored to your role."
          />
          <StepItem
            number={3}
            title="Get Feedback"
            description="Review personalized insights to refine your answers."
          />
        </div>
        <div className="mt-5 text-center">
          <p className="text-sm font-medium text-blue-600">
            Take your first interview — it&apos;s free to try.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 pb-8">
        <h2 className="font-bold text-xl text-gray-900 mb-4 text-center">
          What Candidates Are Saying
        </h2>
        <div className="space-y-3">
          <Testimonial
            name="Sarah Chen"
            role="Software Engineer"
            company="at Google"
            quote="The feedback helped me identify gaps in my answers. I felt much more confident walking into my real interview."
            image="/Sarah_Chen Headshot.png"
          />
          <Testimonial
            name="Marcus Johnson"
            role="Product Manager"
            company="at Amazon"
            quote="Practicing with AI felt like a real conversation. I refined my answers without pressure — it's an incredible tool."
            image="/Marcus_Johnson Headshot.png"
          />
        </div>
        <div className="mt-5 text-center">
          <p className="text-sm text-gray-600">
            ⭐ Hundreds of candidates are using InterviewLab to prepare smarter.
          </p>
        </div>
      </section>

      {/* Mobile CTA Banner */}
      <MobileCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}

/**
 * Feature Item Component
 */
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/**
 * Step Item Component
 */
function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{number}</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Testimonial Component
 */
function Testimonial({
  name,
  role,
  company,
  quote,
  image,
}: {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 text-left shadow-sm">
      <p className="text-sm text-gray-700 mb-3 italic">&quot;{quote}&quot;</p>
      <div className="flex items-center gap-2">
        <Image
          src={image}
          alt={name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm text-gray-900">{name}</p>
          <p className="text-xs text-gray-600">
            {role} {company}
          </p>
        </div>
      </div>
    </div>
  );
}
