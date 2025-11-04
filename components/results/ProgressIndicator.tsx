'use client';

import { CheckCircle2, Lock } from 'lucide-react';

interface ProgressIndicatorProps {
  unlockedCategory: string;
  lockedCategories: string[];
}

/**
 * Progress indicator showing which assessment dimensions are unlocked
 * Part of the report redesign (Task 7)
 */
export function ProgressIndicator({
  unlockedCategory,
  lockedCategories,
}: ProgressIndicatorProps) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-5 my-6">
      <h3 className="text-base font-semibold text-[#1F2937] mb-3">
        Your Full Analysis:
      </h3>
      <div className="space-y-2">
        {/* Unlocked category */}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#10B981] flex-shrink-0" />
          <span className="text-sm text-[#1F2937]">
            {unlockedCategory} Assessment{' '}
            <span className="text-[#6B7280]">(unlocked)</span>
          </span>
        </div>

        {/* Locked categories */}
        {lockedCategories.map((category) => (
          <div key={category} className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
            <span className="text-sm text-[#6B7280]">
              {category} Assessment{' '}
              <span className="text-[#9CA3AF]">(available in Premium)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
