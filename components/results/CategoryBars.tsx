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

  // Design system colors
  const getColorClass = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-cyan-500 to-cyan-600';
    if (score >= 70) return 'bg-gradient-to-r from-cyan-500 to-blue-600';
    if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (score >= 50) return 'bg-slate-400';
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
              <span className="font-semibold text-slate-900">{label}</span>
              <span className="text-sm font-bold text-slate-900">
                {Math.round(score)}/100
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn(
                  'h-full transition-all duration-500 ease-out rounded-full shadow-sm',
                  getColorClass(score)
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{feedback}</p>
          </div>
        );
      })}
    </div>
  );
}
