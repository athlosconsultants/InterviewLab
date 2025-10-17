'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';

/**
 * Mobile CTA Banner
 *
 * T160: Sticky banner prompting mobile visitors to start interview
 *
 * Features:
 * - Appears only on mobile landing page
 * - Sticky positioning at bottom
 * - Dismissible with localStorage persistence
 * - Deep link to setup flow
 * - Touch-optimized design
 */

interface MobileCTAProps {
  className?: string;
}

export function MobileCTA({ className = '' }: MobileCTAProps) {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if banner was previously dismissed
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('mobile-cta-dismissed');
      return !dismissed;
    }
    return true;
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('mobile-cta-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 shadow-2xl z-50 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Message */}
        <div className="flex-1">
          <p className="font-semibold text-sm leading-tight">
            Ready to practice?
          </p>
          <p className="text-xs text-cyan-50 leading-tight">
            Start your free interview now
          </p>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          size="sm"
          className="bg-white text-cyan-600 hover:bg-cyan-50 font-semibold shadow-lg"
        >
          <Link href="/setup" className="flex items-center gap-1">
            Start
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Minimal Mobile CTA
 *
 * Simplified version for pages where full banner might be too intrusive
 */
export function MobileCTAMinimal({ className = '' }: MobileCTAProps) {
  return (
    <div
      className={`fixed bottom-4 left-4 right-4 mx-auto max-w-sm ${className}`}
    >
      <Button
        asChild
        size="lg"
        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-2xl"
      >
        <Link href="/setup" className="flex items-center justify-center gap-2">
          Start Practice Interview
          <ArrowRight className="w-5 h-5" />
        </Link>
      </Button>
    </div>
  );
}
