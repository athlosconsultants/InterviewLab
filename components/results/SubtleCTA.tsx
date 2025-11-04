'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Subtle CTA section for the report redesign (Task 3)
 * Replaces aggressive yellow boxes and cyan buttons
 */
export function SubtleCTA() {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-6 md:p-8 my-10">
      <h2 className="text-xl font-semibold text-[#2C3E50] mb-4">
        Want the Full Picture?
      </h2>
      <p className="text-base leading-relaxed text-[#5A6C7D] mb-5">
        This free assessment analyzed all 3 competencies but only shows
        Communication. Premium interviews give you complete feedback across all
        dimensions, unlimited practice sessions, and realistic voice mode.
      </p>
      <div className="space-y-3">
        <Button
          asChild
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 text-base font-medium rounded-md"
        >
          <Link href="/pricing">See Premium Features</Link>
        </Button>
        <p className="text-sm text-[#6B7280] mt-3">
          Not ready? Your next free assessment unlocks in 7 days
        </p>
      </div>
    </div>
  );
}
