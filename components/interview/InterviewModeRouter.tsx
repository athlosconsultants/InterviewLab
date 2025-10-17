'use client';

import { Suspense } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import { TextUI } from './mode/TextUI';
import { VoiceUI } from './mode/VoiceUI';
import { MobileTextUI } from './mode/MobileTextUI';
import { MobileVoiceUI } from './mode/MobileVoiceUI';
import { Loader2 } from 'lucide-react';
import type { InterviewMode } from '@/lib/schema';

/**
 * Interview Mode Router
 *
 * T158: Automatically renders mobile or desktop UI based on viewport
 *
 * Features:
 * - Detects viewport size with useIsMobile()
 * - Renders mobile UI for mobile devices
 * - Renders desktop UI for desktop devices
 * - Suspense boundary for SSR safety
 * - Re-renders on viewport change
 */

interface InterviewModeRouterProps {
  sessionId: string;
  jobTitle: string;
  company: string;
  mode: InterviewMode;
}

function InterviewModeRouterContent({
  sessionId,
  jobTitle,
  company,
  mode,
}: InterviewModeRouterProps) {
  const { isMobile, isReady } = useIsMobile();

  // Show loading while detecting device
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-cyan-500" />
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Render mobile UI
  if (isMobile) {
    const MobileComponent = mode === 'voice' ? MobileVoiceUI : MobileTextUI;
    return (
      <MobileComponent
        sessionId={sessionId}
        jobTitle={jobTitle}
        company={company}
      />
    );
  }

  // Render desktop UI
  const DesktopComponent = mode === 'voice' ? VoiceUI : TextUI;
  return (
    <DesktopComponent
      sessionId={sessionId}
      jobTitle={jobTitle}
      company={company}
    />
  );
}

export function InterviewModeRouter(props: InterviewModeRouterProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-cyan-500" />
            <p className="text-gray-600">Loading interview...</p>
          </div>
        </div>
      }
    >
      <InterviewModeRouterContent {...props} />
    </Suspense>
  );
}
