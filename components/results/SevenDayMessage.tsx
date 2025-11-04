'use client';

/**
 * 7-day reset messaging component (Task 6)
 * Frames the limit as learning methodology, not a restriction
 */
export function SevenDayMessage() {
  return (
    <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center mt-10">
      <p className="text-base font-medium text-[#4B5563] mb-2">
        📅 Your next free assessment unlocks in 7 days
      </p>
      <p className="text-sm text-[#6B7280]">
        Research shows spaced practice improves retention by 40%
      </p>
    </div>
  );
}
