'use client';

import { VoiceUI } from './VoiceUI';

/**
 * Mobile Voice Interview UI
 *
 * T157: Mobile-optimized voice interview interface
 *
 * This component wraps the desktop VoiceUI with mobile-specific styling
 * and layout adjustments. The core voice functionality remains the same.
 */

interface MobileVoiceUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

export function MobileVoiceUI({
  sessionId,
  jobTitle,
  company,
}: MobileVoiceUIProps) {
  return (
    <div className="mobile-voice-ui min-h-screen">
      {/* Add mobile-specific wrapper styles */}
      <style jsx global>{`
        .mobile-voice-ui {
          /* Ensure full viewport height on mobile */
          min-height: 100vh;
          min-height: -webkit-fill-available;
        }

        /* Mobile-specific adjustments for voice UI */
        @media (max-width: 768px) {
          /* Make voice orb slightly smaller on mobile for better fit */
          .mobile-voice-ui .voice-orb-container {
            transform: scale(0.9);
          }

          /* Adjust button sizes for touch targets */
          .mobile-voice-ui button {
            min-height: 44px;
            min-width: 44px;
          }

          /* Improve text readability on mobile */
          .mobile-voice-ui .question-text {
            font-size: 1.125rem;
            line-height: 1.75;
          }

          /* Optimize timer ring for mobile */
          .mobile-voice-ui .timer-ring {
            width: 280px;
            height: 280px;
          }

          /* Make controls more thumb-friendly */
          .mobile-voice-ui .control-button {
            padding: 1rem;
            border-radius: 9999px;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          .mobile-voice-ui {
            overflow-y: auto;
          }

          .mobile-voice-ui .voice-orb-container {
            transform: scale(0.75);
          }
        }
      `}</style>

      {/* Render the desktop VoiceUI - it's already responsive */}
      <VoiceUI sessionId={sessionId} jobTitle={jobTitle} company={company} />
    </div>
  );
}
