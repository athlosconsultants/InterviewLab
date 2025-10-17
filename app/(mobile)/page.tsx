'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Zap,
  Target,
  Award,
  TrendingUp,
  Clock,
  Users,
} from 'lucide-react';

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
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-4">
            <p className="text-white font-semibold text-sm">
              ⚡ Free AI Interview Practice
            </p>
          </div>
        </div>

        <h1 className="text-4xl font-bold leading-tight mb-4">
          Nervous About Your Next{' '}
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Job Interview?
          </span>
        </h1>

        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          Practice with AI trained on <strong>S&amp;P 500 companies</strong> —
          Get personalized feedback in minutes, not days.
        </p>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white" />
          </div>
          <p className="text-sm text-gray-600">
            <strong>1,247+</strong> users landed jobs this month
          </p>
        </div>
      </section>

      {/* Value Stack - Hormozi Style */}
      <section className="px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-center">
            <h2 className="text-white font-bold text-xl mb-1">
              What You Get (FREE)
            </h2>
            <p className="text-cyan-100 text-sm">
              Everything you need to crush your interview
            </p>
          </div>

          {/* Value Items */}
          <div className="p-6 space-y-4">
            <ValueItem
              icon={<Target className="w-5 h-5" />}
              title="AI Interviewer Trained on Real Companies"
              value="$997/mo value"
              description="Practice with questions from Google, Amazon, Microsoft & more"
            />
            <ValueItem
              icon={<Zap className="w-5 h-5" />}
              title="Instant Personalized Feedback"
              value="$497/mo value"
              description="Know exactly what to improve after every answer"
            />
            <ValueItem
              icon={<Award className="w-5 h-5" />}
              title="Voice + Text Interview Modes"
              value="$297/mo value"
              description="Practice speaking out loud or type your responses"
            />
            <ValueItem
              icon={<TrendingUp className="w-5 h-5" />}
              title="Progress Tracking & Analytics"
              value="$197/mo value"
              description="See your improvement over time with detailed metrics"
            />

            {/* Total Value */}
            <div className="pt-4 border-t-2 border-dashed border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">
                  Total Value:
                </span>
                <span className="text-gray-400 line-through text-lg">
                  $1,988/mo
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl">Your Price Today:</span>
                <span className="font-bold text-4xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  FREE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="px-6 pb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-lg text-green-900 mb-2">
            Our Guarantee
          </h3>
          <p className="text-green-800 text-sm leading-relaxed">
            If you don&apos;t feel more confident after your first practice
            interview, we&apos;ll personally coach you through it — for free.
          </p>
        </div>
      </section>

      {/* Urgency/Scarcity */}
      <section className="px-6 pb-8">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">
                Limited Free Access
              </h3>
              <p className="text-orange-800 text-sm leading-relaxed">
                We&apos;re currently offering free interviews to the first{' '}
                <strong>10,000 users</strong>. After that, it&apos;s $49/month.
                Secure your spot now.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Social Proof */}
      <section className="px-6 pb-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <p className="font-semibold text-gray-700">
              Join 5,000+ Job Seekers
            </p>
          </div>
          <div className="space-y-3">
            <Testimonial
              name="Sarah Chen"
              role="Software Engineer"
              company="at Google"
              quote="Got my dream job offer after 3 practice sessions. The feedback was spot-on."
            />
            <Testimonial
              name="Marcus Johnson"
              role="Product Manager"
              company="at Amazon"
              quote="Went from nervous to confident. This is a game-changer for interview prep."
            />
          </div>
        </div>
      </section>

      {/* Sticky CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 px-6 py-4 shadow-2xl z-50">
        <Button
          asChild
          size="lg"
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
        >
          <Link href="/setup">{ctaText} →</Link>
        </Button>
        <p className="text-center text-xs text-gray-500 mt-2">
          No credit card required • Start in 30 seconds
        </p>
      </div>
    </div>
  );
}

/**
 * Value Item Component
 */
function ValueItem({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {title}
          </h3>
          <span className="text-xs font-bold text-green-600 whitespace-nowrap">
            {value}
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
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
