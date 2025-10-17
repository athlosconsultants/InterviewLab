'use client';

import { Loader2 } from 'lucide-react';
import { BaseInterviewUI } from '../BaseInterviewUI';
import { MobileContainer, MobileSection } from '../layout/MobileContainer';

/**
 * Mobile Voice Interview UI
 *
 * T157: Mobile-optimized voice interview interface using BaseInterviewUI
 *
 * TODO: Full implementation pending - voice recording integration needed
 * For now, displays a message that voice mode is coming soon on mobile
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
    <BaseInterviewUI
      sessionId={sessionId}
      jobTitle={jobTitle}
      company={company}
    >
      {() => (
        <MobileContainer>
          <MobileSection>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4 max-w-md mx-auto p-6">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-cyan-500" />
                <h2 className="text-2xl font-bold">Voice Mode</h2>
                <p className="text-gray-600">
                  Mobile voice interviews coming soon. Please use desktop for
                  voice mode, or switch to text mode on mobile.
                </p>
              </div>
            </div>
          </MobileSection>
        </MobileContainer>
      )}
    </BaseInterviewUI>
  );
}
