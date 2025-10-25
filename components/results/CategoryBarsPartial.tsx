'use client';

import { cn } from '@/lib/utils';
import type { InterviewFeedback } from '@/lib/scoring';
import { Lock } from 'lucide-react';

interface CategoryBarsPartialProps {
  dimensions: InterviewFeedback['dimensions'];
}

/**
 * T51: Partial results component for free tier
 * Shows only Communication unlocked, other metrics are blurred/locked
 */
export function CategoryBarsPartial({ dimensions }: CategoryBarsPartialProps) {
  const dimensionLabels = {
    technical_competency: 'Technical Competency',
    communication: 'Communication',
    problem_solving: 'Problem Solving',
    cultural_fit: 'Cultural Fit',
  };

  const getColorClass = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {Object.entries(dimensions).map(([key, value]) => {
        const label = dimensionLabels[key as keyof typeof dimensionLabels];
        const isUnlocked = key === 'communication'; // T51: Only Communication unlocked
        const score = value.score;
        const feedback = value.feedback;

        if (isUnlocked) {
          // Show full metric for Communication
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{label}</span>
                <span className="text-sm font-semibold">
                  {Math.round(score)}/100
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full transition-all duration-1000 ease-out rounded-full',
                    getColorClass(score)
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feedback}
              </p>
            </div>
          );
        }

        // Locked metrics - blurred and with lock icon
        return (
          <div
            key={key}
            className="space-y-2 relative opacity-50 pointer-events-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{label}</span>
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold blur-sm">XX/100</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted blur-sm">
              <div
                className="h-full bg-slate-400 rounded-full"
                style={{ width: '70%' }}
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed blur-sm select-none">
              Upgrade to unlock detailed feedback for this dimension...
            </p>
          </div>
        );
      })}
    </div>
  );
}
