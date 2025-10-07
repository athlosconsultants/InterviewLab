'use client';

import { cn } from '@/lib/utils';
import type { InterviewFeedback } from '@/lib/scoring';

interface CategoryBarsProps {
  dimensions: InterviewFeedback['dimensions'];
}

export function CategoryBars({ dimensions }: CategoryBarsProps) {
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
        const score = value.score;
        const feedback = value.feedback;

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
      })}
    </div>
  );
}
