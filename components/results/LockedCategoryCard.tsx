'use client';

import { useState } from 'react';
import { Lock, Info, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface LockedCategoryCardProps {
  label: string;
  categoryKey: string;
}

const categoryDetails = {
  technical_competency: [
    'Problem decomposition and solution architecture',
    'Code quality and best practices awareness',
    'Technical communication and documentation',
    'System thinking and scalability considerations',
  ],
  problem_solving: [
    'Structured thinking under pressure',
    'Creative solution generation',
    'Tradeoff analysis and prioritization',
    'Edge case handling and risk mitigation',
  ],
  cultural_fit: [
    'Values alignment with company culture',
    'Team collaboration and communication style',
    'Adaptability and growth mindset',
    'Professional maturity and self-awareness',
  ],
};

/**
 * Locked category card with info disclosure (Task 2 & Task 9)
 * Shows ??/100 and allows expanding to see what's included
 */
export function LockedCategoryCard({
  label,
  categoryKey,
}: LockedCategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const details =
    categoryDetails[categoryKey as keyof typeof categoryDetails] || [];

  return (
    <div className="space-y-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-5 opacity-65">
      {/* Header with lock icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#6B7280]">{label}</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-[#E5E7EB] rounded-full p-1 transition-colors"
            aria-label="Show assessment details"
          >
            <Info className="h-4 w-4 text-[#9CA3AF]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#6B7280]">??/100</span>
          <Lock className="h-4 w-4 text-[#9CA3AF]" />
        </div>
      </div>

      {/* Grayed-out progress bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full bg-[#9CA3AF] rounded-full"
          style={{ width: '50%' }}
        />
      </div>

      {/* Feedback area with blur */}
      <div className="relative">
        <p className="text-sm text-[#6B7280] blur-[2px] select-none pointer-events-none">
          Available in Premium
        </p>
      </div>

      {/* Expandable info disclosure */}
      {isExpanded && (
        <div className="mt-4 p-4 rounded-md bg-white border border-[#E5E7EB]">
          <p className="text-sm font-medium text-[#1F2937] mb-2">
            {label} Assessment includes:
          </p>
          <ul className="space-y-1.5 mb-3">
            {details.map((detail, index) => (
              <li key={index} className="text-sm text-[#4B5563] flex gap-2">
                <span className="text-[#6B7280]">•</span>
                {detail}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium inline-flex items-center gap-1"
          >
            See detailed feedback in Premium →
          </Link>
        </div>
      )}
    </div>
  );
}
