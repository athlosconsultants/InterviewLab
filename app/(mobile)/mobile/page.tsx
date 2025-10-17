'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Target, Award, TrendingUp } from 'lucide-react';

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
  const [ctaText] = useState('Start Your Free Interview Now');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-cyan-50/30 to-blue-50/50 pb-24">
      {/* Hero Section - Pain + Dream Outcome */}
      <section className="px-6 pt-12 pb-8 text-center">
        <div className="mb-6">
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-full mb-4">
            <p className="text-gray-700 font-medium text-sm">
              AI-Powered Interview Practice
            </p>
          </div>
        </div>

        <h1 className="text-4xl font-bold leading-tight mb-4">
          Practice Interviews with{' '}
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Confidence
          </span>
        </h1>

        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          Experience realistic interview scenarios powered by AI trained on real
          company interview frameworks. Get actionable feedback to improve your
          performance.
        </p>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white" />
          </div>
          <p className="text-sm text-gray-600">
            Trusted by thousands of job seekers
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-bold text-xl text-gray-900 text-center">
              Everything You Need to Succeed
            </h2>
          </div>

          {/* Value Items */}
          <div className="p-6 space-y-5">
            <FeatureItem
              icon={<Target className="w-5 h-5" />}
              title="Industry-Specific Questions"
              description="Practice with questions based on real interview frameworks from leading companies"
            />
            <FeatureItem
              icon={<Zap className="w-5 h-5" />}
              title="Instant Feedback"
              description="Receive detailed analysis and suggestions after each response"
            />
            <FeatureItem
              icon={<Award className="w-5 h-5" />}
              title="Multiple Practice Modes"
              description="Choose between voice interviews or text-based responses"
            />
            <FeatureItem
              icon={<TrendingUp className="w-5 h-5" />}
              title="Track Your Progress"
              description="Monitor your improvement with detailed performance metrics"
            />
          </div>

          {/* CTA in card */}
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 text-center border border-cyan-100">
              <p className="text-sm text-gray-600 mb-1">Get started today</p>
              <p className="text-2xl font-bold text-gray-900">Free to try</p>
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
            description="Share your CV and target job description"
          />
          <StepItem
            number={2}
            title="Start Practicing"
            description="Answer AI-generated questions tailored to your role"
          />
          <StepItem
            number={3}
            title="Get Feedback"
            description="Review personalized insights to improve your answers"
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 pb-8">
        <h2 className="font-bold text-xl text-gray-900 mb-4 text-center">
          What Our Users Say
        </h2>
        <div className="space-y-3">
          <Testimonial
            name="Sarah Chen"
            role="Software Engineer"
            company="at Google"
            quote="The feedback helped me identify gaps in my responses. I felt much more prepared going into my actual interview."
          />
          <Testimonial
            name="Marcus Johnson"
            role="Product Manager"
            company="at Amazon"
            quote="Practicing with AI allowed me to refine my answers without the pressure. Great tool for interview preparation."
          />
        </div>
      </section>

      {/* Sticky CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg z-50">
        <Button
          asChild
          size="lg"
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          <Link href="/setup">Start Practice Interview</Link>
        </Button>
        <p className="text-center text-xs text-gray-500 mt-2">
          No credit card required
        </p>
      </div>
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
}: {
  name: string;
  role: string;
  company: string;
  quote: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 text-left shadow-sm">
      <p className="text-sm text-gray-700 mb-3 italic">&quot;{quote}&quot;</p>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full" />
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
