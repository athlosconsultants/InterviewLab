'use client';

import { ScoreDial } from './ScoreDial';
import { CategoryBars } from './CategoryBars';
import { CategoryBarsPartial } from './CategoryBarsPartial';
import type { InterviewFeedback } from '@/lib/scoring';
import { Button } from '@/components/ui/button';
import {
  Download,
  Home,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface ReportViewProps {
  session: any;
  turns: any[];
  feedback: InterviewFeedback;
  reportId?: string;
  planTier?: string; // T51: For conditional upsell display
}

export function ReportView({
  session,
  turns,
  feedback,
  reportId,
  planTier = 'free',
}: ReportViewProps) {
  const jobTitle = session.job_spec?.role || session.job_title || 'Position';
  const company = session.company || 'Company';

  const isFree = planTier === 'free';

  // Filter out small talk, confirmation, and welcome turns for accurate question count
  const actualInterviewTurns = turns.filter(
    (turn) =>
      turn.question?.category !== 'small_talk' &&
      (turn as any).turn_type !== 'small_talk' &&
      (turn as any).turn_type !== 'confirmation'
  );

  const handleDownloadPDF = async () => {
    // For mobile and in-app browsers, use a more robust download method
    try {
      // Try to use the native print dialog
      if (window.print) {
        window.print();
      }
    } catch (error) {
      console.error('Print failed:', error);
      // Fallback: open report in new window for manual save
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl p-4 py-8 space-y-8">
        {/* T51 & T52: Upsell Banner for free tier users */}
        {isFree && (
          <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 p-4 md:p-6 shadow-lg">
            <div className="text-center space-y-3 md:space-y-4">
              {/* Social Proof - Critical for TikTok/IG traffic */}
              <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400">
                2,847 people practiced this week. 73%{' '}
                <span className="hidden sm:inline">got interviews</span> in 30
                days.
              </p>

              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-cyan-600" />
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Don&apos;t Stop Now - You&apos;re Just Getting Started
                </h2>
              </div>

              {/* Mobile-optimized copy */}
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
                You&apos;ve seen how our AI works. Now imagine being this
                prepared for your REAL interview.
              </p>

              <p className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
                Most users practice{' '}
                <span className="hidden sm:inline">4-6 times</span>
                <span className="sm:hidden">4-6x</span> before they feel truly
                confident.
              </p>

              <div className="flex gap-3 md:gap-4 justify-center pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg text-sm md:text-base"
                >
                  <Link href="/pricing">
                    <span className="hidden sm:inline">Show Me The Plans</span>
                    <span className="sm:hidden">See Plans</span>
                    <span className="ml-1 md:ml-2">→</span>
                  </Link>
                </Button>
              </div>

              {/* Risk Reversal */}
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2">
                <span className="hidden sm:inline">
                  Not more confident after 3 practice sessions? Email us for a
                  refund.
                </span>
                <span className="sm:hidden">
                  Not confident after 3 sessions? Get a refund.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* "Here's What You're Missing" for free tier */}
        {isFree && (
          <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 md:p-6 shadow-md">
            <h3 className="text-lg md:text-xl font-bold text-amber-900 dark:text-amber-100 mb-3 md:mb-4">
              Here&apos;s What You&apos;re Missing:
            </h3>
            <div className="space-y-2 md:space-y-3 text-sm md:text-base text-amber-900/90 dark:text-amber-100/90">
              <p className="leading-relaxed">
                <strong className="font-semibold">
                  <span className="hidden sm:inline">
                    Unlimited Practice Until It Feels Natural
                  </span>
                  <span className="sm:hidden">Unlimited Practice</span>
                </strong>{' '}
                -{' '}
                <span className="hidden sm:inline">
                  No limits on how many times you can practice. Average user
                  does 6 sessions.
                </span>
                <span className="sm:hidden">
                  No limits. Average user does 6 sessions before feeling
                  confident.
                </span>
              </p>
              <p className="leading-relaxed">
                <strong className="font-semibold">
                  Realistic Voice Interviews
                </strong>{' '}
                -{' '}
                <span className="hidden sm:inline">
                  AI trained on 10,000+ real S&P 500 interviews. Feels like the
                  real thing.
                </span>
                <span className="sm:hidden">
                  AI trained on real Google, Meta, Goldman interviews.
                </span>
              </p>
              <p className="leading-relaxed">
                <strong className="font-semibold">
                  <span className="hidden sm:inline">
                    Every Interview Type Covered
                  </span>
                  <span className="sm:hidden">Every Interview Type</span>
                </strong>{' '}
                -{' '}
                <span className="hidden sm:inline">
                  Behavioral, technical, case studies, panel interviews.
                  We&apos;ve seen them all.
                </span>
                <span className="sm:hidden">
                  Behavioral, technical, case studies, panel interviews.
                </span>
              </p>
              <p className="leading-relaxed">
                <strong className="font-semibold">
                  Know Exactly What to Fix
                </strong>{' '}
                -{' '}
                <span className="hidden sm:inline">
                  AI tells you why your answer fell flat and how to make it
                  compelling. Tracks your &apos;um&apos; count, response length,
                  STAR format.
                </span>
                <span className="sm:hidden">
                  See your &apos;um&apos; count, response length, what worked
                  and what didn&apos;t.
                </span>
              </p>
              <p className="leading-relaxed">
                <strong className="font-semibold">
                  <span className="hidden sm:inline">
                    Gets Harder As You Improve
                  </span>
                  <span className="sm:hidden">Gets Harder As You Improve</span>
                </strong>{' '}
                -{' '}
                <span className="hidden sm:inline">
                  Questions adapt to your skill level. You&apos;ll be
                  challenged, not coddled.
                </span>
                <span className="sm:hidden">
                  Questions adapt to you. Challenge yourself.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Testimonial for free tier */}
        {isFree && (
          <div className="rounded-lg border bg-slate-100 dark:bg-slate-800 p-4 md:p-6 shadow-sm">
            <div className="text-center space-y-2 md:space-y-3">
              <p className="text-base md:text-lg italic text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="hidden sm:inline">
                  &ldquo;I went from rambling messes to confident 2-minute
                  answers in 3 days. Got offers from 2 out of 3
                  companies.&rdquo;
                </span>
                <span className="sm:hidden">
                  &ldquo;Rambling messes → confident answers in 3 days. Got 2
                  out of 3 offers.&rdquo;
                </span>
              </p>
              <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
                <span className="hidden sm:inline">
                  - Marcus T., Software Engineer, now at Atlassian
                </span>
                <span className="sm:hidden">- Marcus T., SWE at Atlassian</span>
              </p>
            </div>
          </div>
        )}

        {/* Pricing reminder for free tier */}
        {isFree && (
          <div className="text-center p-3 md:p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
            <p className="text-base md:text-lg font-bold text-cyan-900 dark:text-cyan-100">
              <span className="hidden sm:inline">
                Plans from A$29.99 - One payment, no subscription
              </span>
              <span className="sm:hidden">
                From A$29.99 - One payment, no subscription
              </span>
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Interview Report</h1>
          <p className="text-xl text-muted-foreground">
            {jobTitle} at {company}
          </p>
          <p className="text-sm text-muted-foreground">
            Completed {actualInterviewTurns.length} question
            {actualInterviewTurns.length !== 1 ? 's' : ''} •{' '}
            {new Date(feedback.generated_at).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Score */}
        <div className="flex flex-col items-center space-y-6 py-8">
          <ScoreDial
            score={feedback.overall.score}
            grade={feedback.overall.grade}
          />
          <div className="text-center max-w-2xl">
            <h2 className="text-2xl font-semibold mb-3">Overall Assessment</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {feedback.overall.summary}
            </p>
          </div>
        </div>

        {/* Dimension Scores - T51: Partial for free tier */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Performance Breakdown
            {isFree && (
              <span className="ml-auto text-sm font-normal text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Unlock all dimensions
              </span>
            )}
          </h2>
          {isFree ? (
            <CategoryBarsPartial dimensions={feedback.dimensions} />
          ) : (
            <CategoryBars dimensions={feedback.dimensions} />
          )}
        </div>

        {/* Strengths & Improvements - T51: Locked for free tier */}
        {isFree ? (
          <div className="rounded-lg border bg-card p-6 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold text-muted-foreground">
                  Detailed strengths and growth areas
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/pricing">Unlock Full Analysis</Link>
                </Button>
              </div>
            </div>
            <div className="blur-sm select-none pointer-events-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-green-600 dark:text-green-400 mt-1">
                        •
                      </span>
                      <span className="text-sm leading-relaxed">
                        Example strength placeholder text...
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 dark:text-green-400 mt-1">
                        •
                      </span>
                      <span className="text-sm leading-relaxed">
                        Another strength example...
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5" />
                    Areas for Growth
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-amber-600 dark:text-amber-400 mt-1">
                        •
                      </span>
                      <span className="text-sm leading-relaxed">
                        Example improvement placeholder...
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-amber-600 dark:text-amber-400 mt-1">
                        •
                      </span>
                      <span className="text-sm leading-relaxed">
                        Another growth area example...
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Key Strengths
              </h3>
              <ul className="space-y-3">
                {feedback.exemplars.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 mt-1">
                      •
                    </span>
                    <span className="text-sm leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-5 w-5" />
                Areas for Growth
              </h3>
              <ul className="space-y-3">
                {feedback.exemplars.improvements.map((improvement, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-amber-600 dark:text-amber-400 mt-1">
                      •
                    </span>
                    <span className="text-sm leading-relaxed">
                      {improvement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Actionable Tips - T51: Locked for free tier */}
        {isFree ? (
          <div className="rounded-lg border bg-card p-6 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold text-muted-foreground">
                  Personalized action plan
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/pricing">Unlock Full Report</Link>
                </Button>
              </div>
            </div>
            <div className="blur-sm select-none pointer-events-none">
              <h2 className="text-2xl font-semibold mb-4">Actionable Tips</h2>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="font-semibold text-primary">1.</span>
                  <p className="text-sm leading-relaxed">
                    Example actionable tip placeholder text...
                  </p>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="font-semibold text-primary">2.</span>
                  <p className="text-sm leading-relaxed">
                    Another tip example for improvement...
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Actionable Tips</h2>
            <div className="space-y-3">
              {feedback.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-semibold text-primary">
                    {index + 1}.
                  </span>
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions - T53: Replay for free tier, New Interview for paid */}
        <div className="flex flex-wrap gap-3 md:gap-4 justify-center pt-4">
          {isFree ? (
            <>
              <Button
                asChild
                variant="outline"
                className="text-sm md:text-base"
              >
                <Link href="/assessment/setup">
                  <Home className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">
                    Try Again (1 per week)
                  </span>
                  <span className="sm:hidden">Try Again</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="default"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-sm md:text-base"
              >
                <Link href="/pricing">
                  <Sparkles className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Unlock Full Access</span>
                  <span className="sm:hidden">Unlock Full</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/setup">
                  <Home className="mr-2 h-4 w-4" />
                  New Interview
                </Link>
              </Button>
              {reportId && (
                <Button variant="default" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
