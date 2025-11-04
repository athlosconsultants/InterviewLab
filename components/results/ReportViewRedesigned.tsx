'use client';

import { ScoreDial } from './ScoreDial';
import { CategoryBarsRedesigned } from './CategoryBarsRedesigned';
import { ProgressIndicator } from './ProgressIndicator';
import { SubtleCTA } from './SubtleCTA';
import { SevenDayMessage } from './SevenDayMessage';
import type { InterviewFeedback } from '@/lib/scoring';
import { Button } from '@/components/ui/button';
import { Download, Home } from 'lucide-react';
import Link from 'next/link';

interface ReportViewRedesignedProps {
  session: any;
  turns: any[];
  feedback: InterviewFeedback;
  reportId?: string;
  planTier?: string;
}

/**
 * Completely redesigned report view based on behavioral economics principles
 * Implements sophisticated, high-value assessment report that naturally creates upgrade desire
 * Follows cursor-handoff-prompt.md specification
 */
export function ReportViewRedesigned({
  session,
  turns,
  feedback,
  reportId,
  planTier = 'free',
}: ReportViewRedesignedProps) {
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
    try {
      if (window.print) {
        window.print();
      }
    } catch (error) {
      console.error('Print failed:', error);
      window.open(window.location.href, '_blank');
    }
  };

  // Get color for overall score
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // success
    if (score >= 70) return '#3B82F6'; // primary-blue
    if (score >= 60) return '#F59E0B'; // warning
    return '#EF4444'; // error
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-10">
        {/* TASK 1: NEW PAGE STRUCTURE - Report Header */}
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold text-[#1F2937] leading-tight">
            Interview Report
          </h1>
          <p className="text-[18px] text-[#6B7280]">
            {jobTitle} at {company}
          </p>
          <p className="text-sm text-[#9CA3AF]">
            Completed {actualInterviewTurns.length} question
            {actualInterviewTurns.length !== 1 ? 's' : ''} •{' '}
            {new Date(feedback.generated_at).toLocaleDateString()}
          </p>
        </div>

        {/* TASK 1: Overall Assessment Card */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col items-center space-y-6">
            <ScoreDial
              score={feedback.overall.score}
              grade={feedback.overall.grade}
            />
            <div className="text-center max-w-2xl">
              <h2 className="text-[22px] font-semibold text-[#1F2937] mb-3">
                Overall Assessment
              </h2>
              <p className="text-base text-[#4B5563] leading-relaxed">
                {feedback.overall.summary}
              </p>
            </div>
          </div>
        </div>

        {/* TASK 7: Progress Indicator (only for free tier) */}
        {isFree && (
          <ProgressIndicator
            unlockedCategory="Communication"
            lockedCategories={['Technical Competency', 'Problem Solving']}
          />
        )}

        {/* TASK 1 & TASK 2: Performance Breakdown Section */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-sm">
          <h2 className="text-[22px] font-semibold text-[#1F2937] mb-6">
            Performance Breakdown
          </h2>
          {isFree ? (
            <CategoryBarsRedesigned dimensions={feedback.dimensions} />
          ) : (
            <div className="space-y-5">
              {Object.entries(feedback.dimensions).map(([key, value]) => {
                const labels = {
                  technical_competency: 'Technical Competency',
                  communication: 'Communication',
                  problem_solving: 'Problem Solving',
                  cultural_fit: 'Cultural Fit',
                };
                const label = labels[key as keyof typeof labels];
                const score = value.score;

                const getColorClass = (s: number) => {
                  if (s >= 80) return 'bg-[#10B981]';
                  if (s >= 70) return 'bg-[#3B82F6]';
                  if (s >= 60) return 'bg-[#F59E0B]';
                  return 'bg-[#EF4444]';
                };

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1F2937]">
                        {label}
                      </span>
                      <span className="text-sm font-semibold text-[#1F2937]">
                        {Math.round(score)}/100
                      </span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div
                        className={`h-full transition-all duration-500 ease-out rounded-full ${getColorClass(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="text-sm text-[#4B5563] leading-relaxed pt-1">
                      {value.feedback}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TASK 3: Subtle CTA Section (only for free tier) */}
        {isFree && <SubtleCTA />}

        {/* Strengths & Improvements - Shown for paid, hidden for free */}
        {!isFree && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h3 className="text-[18px] font-semibold text-[#10B981] mb-4">
                Key Strengths
              </h3>
              <ul className="space-y-3">
                {feedback.exemplars.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-[#10B981] mt-1">•</span>
                    <span className="text-sm text-[#4B5563] leading-relaxed">
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h3 className="text-[18px] font-semibold text-[#F59E0B] mb-4">
                Areas for Growth
              </h3>
              <ul className="space-y-3">
                {feedback.exemplars.improvements.map((improvement, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-[#F59E0B] mt-1">•</span>
                    <span className="text-sm text-[#4B5563] leading-relaxed">
                      {improvement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Actionable Tips - Shown for paid, hidden for free */}
        {!isFree && (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[22px] font-semibold text-[#1F2937] mb-4">
              Actionable Tips
            </h2>
            <div className="space-y-3">
              {feedback.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 rounded-lg bg-[#F9FAFB]"
                >
                  <span className="font-semibold text-[#3B82F6]">
                    {index + 1}.
                  </span>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASK 6: 7-Day Reset Messaging (only for free tier) */}
        {isFree && <SevenDayMessage />}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          {isFree ? (
            <>
              <Button
                asChild
                className="bg-transparent border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white px-6"
              >
                <Link href="/assessment/setup">
                  <Home className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    Try Again (in 7 days)
                  </span>
                  <span className="sm:hidden">Try Again</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                className="bg-transparent border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
              >
                <Link href="/setup">
                  <Home className="mr-2 h-4 w-4" />
                  New Interview
                </Link>
              </Button>
              {reportId && (
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                >
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
