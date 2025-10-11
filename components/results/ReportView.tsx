'use client';

import { ScoreDial } from './ScoreDial';
import { CategoryBars } from './CategoryBars';
import type { InterviewFeedback } from '@/lib/scoring';
import { Button } from '@/components/ui/button';
import {
  Download,
  Home,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface ReportViewProps {
  session: any;
  turns: any[];
  feedback: InterviewFeedback;
  reportId?: string;
}

export function ReportView({
  session,
  turns,
  feedback,
  reportId,
}: ReportViewProps) {
  const jobTitle = session.job_spec?.role || 'Position';
  const company = session.company || 'Company';

  const handleDownloadPDF = () => {
    // Generate PDF-friendly view and trigger print dialog
    window.print();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl p-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Interview Report</h1>
          <p className="text-xl text-muted-foreground">
            {jobTitle} at {company}
          </p>
          <p className="text-sm text-muted-foreground">
            Completed {turns.length} questions •{' '}
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

        {/* Dimension Scores */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Performance Breakdown
          </h2>
          <CategoryBars dimensions={feedback.dimensions} />
        </div>

        {/* Strengths & Improvements */}
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
                  <span className="text-sm leading-relaxed">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Tips */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Actionable Tips</h2>
          <div className="space-y-3">
            {feedback.tips.map((tip, index) => (
              <div
                key={index}
                className="flex gap-3 p-3 rounded-lg bg-muted/50"
              >
                <span className="font-semibold text-primary">{index + 1}.</span>
                <p className="text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center pt-4">
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
        </div>
      </div>
    </main>
  );
}
