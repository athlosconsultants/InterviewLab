'use client';

import { ReactNode } from 'react';

/**
 * Mobile Interview Container
 *
 * T155: Mobile-first layout wrapper for interview UI
 *
 * Features:
 * - Full-height layout with safe area insets
 * - Scrollable content area
 * - Sticky action bar at bottom
 * - Touch-optimized spacing
 * - No horizontal scroll
 */

interface MobileContainerProps {
  children: ReactNode;
  actionBar?: ReactNode;
  className?: string;
}

export function MobileContainer({
  children,
  actionBar,
  className = '',
}: MobileContainerProps) {
  return (
    <div
      className={`flex flex-col min-h-screen bg-gradient-to-b from-white via-cyan-50/30 to-blue-50/50 ${className}`}
    >
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-4 py-6 pb-24">{children}</div>
      </div>

      {/* Sticky action bar */}
      {actionBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-50">
          {actionBar}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile Content Section
 *
 * Standardized spacing for mobile content sections
 */
interface MobileSectionProps {
  children: ReactNode;
  className?: string;
}

export function MobileSection({
  children,
  className = '',
}: MobileSectionProps) {
  return <div className={`mb-6 ${className}`}>{children}</div>;
}

/**
 * Mobile Card
 *
 * Card component optimized for mobile touch targets
 */
interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({
  children,
  className = '',
  onClick,
}: MobileCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${onClick ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Mobile Header
 *
 * Progress and stage info header for mobile
 */
interface MobileHeaderProps {
  questionNumber: number;
  totalQuestions: number;
  stageName?: string | null;
}

export function MobileHeader({
  questionNumber,
  totalQuestions,
  stageName,
}: MobileHeaderProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="mb-6">
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {questionNumber} of {totalQuestions}
          </span>
          {stageName && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {stageName}
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
