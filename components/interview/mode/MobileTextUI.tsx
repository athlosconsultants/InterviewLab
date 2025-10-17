'use client';

import { TextUI } from './TextUI';

/**
 * Mobile Text Interview UI
 *
 * T156: Mobile-optimized text interview interface
 *
 * This component wraps the desktop TextUI with mobile-specific styling.
 * The core interview functionality remains the same.
 */

interface MobileTextUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

export function MobileTextUI({
  sessionId,
  jobTitle,
  company,
}: MobileTextUIProps) {
  return (
    <div className="mobile-text-ui min-h-screen">
      {/* Add mobile-specific wrapper styles */}
      <style jsx global>{`
        .mobile-text-ui {
          /* Ensure full viewport height on mobile */
          min-height: 100vh;
          min-height: -webkit-fill-available;
        }

        /* Mobile-specific adjustments for text UI */
        @media (max-width: 768px) {
          /* Improve textarea sizing for mobile */
          .mobile-text-ui textarea {
            min-height: 120px;
            font-size: 16px; /* Prevents zoom on iOS */
          }

          /* Make buttons touch-friendly */
          .mobile-text-ui button {
            min-height: 44px;
            min-width: 44px;
          }

          /* Optimize question display for mobile */
          .mobile-text-ui .question-bubble {
            font-size: 1.125rem;
            line-height: 1.75;
          }

          /* Better spacing on mobile */
          .mobile-text-ui .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          .mobile-text-ui {
            overflow-y: auto;
          }

          .mobile-text-ui textarea {
            min-height: 80px;
          }
        }
      `}</style>

      {/* Render the desktop TextUI - it's already responsive */}
      <TextUI sessionId={sessionId} jobTitle={jobTitle} company={company} />
    </div>
  );
}
