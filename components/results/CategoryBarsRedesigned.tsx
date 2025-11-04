'use client';

import type { InterviewFeedback } from '@/lib/scoring';
import { LockedCategoryCard } from './LockedCategoryCard';

interface CategoryBarsRedesignedProps {
  dimensions: InterviewFeedback['dimensions'];
}

/**
 * Redesigned category bars for free tier report
 * Shows Communication unlocked, other dimensions as locked cards with ??/100
 * Implements Task 2 & Task 4 requirements
 */
export function CategoryBarsRedesigned({
  dimensions,
}: CategoryBarsRedesignedProps) {
  const dimensionLabels = {
    technical_competency: 'Technical Competency',
    communication: 'Communication',
    problem_solving: 'Problem Solving',
    cultural_fit: 'Cultural Fit',
  };

  // Color based on score using the new palette
  const getColorClass = (score: number) => {
    if (score >= 80) return 'bg-[#10B981]'; // success
    if (score >= 70) return 'bg-[#3B82F6]'; // primary-blue
    if (score >= 60) return 'bg-[#F59E0B]'; // warning
    if (score >= 50) return 'bg-[#EF4444]'; // error
    return 'bg-[#EF4444]'; // error
  };

  return (
    <div className="space-y-5">
      {Object.entries(dimensions).map(([key, value]) => {
        const label = dimensionLabels[key as keyof typeof dimensionLabels];
        const isUnlocked = key === 'communication'; // Only Communication unlocked
        const score = value.score;
        const feedback = value.feedback;

        if (isUnlocked) {
          // Show full unlocked Communication card
          return (
            <div
              key={key}
              className="space-y-2 rounded-lg border border-[#E5E7EB] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1F2937]">{label}</span>
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
                {feedback}
              </p>
            </div>
          );
        }

        // Locked category card
        return <LockedCategoryCard key={key} label={label} categoryKey={key} />;
      })}
    </div>
  );
}
