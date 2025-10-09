'use client';

import { Loader2 } from 'lucide-react';

interface VoiceUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

export function VoiceUI({ sessionId, jobTitle, company }: VoiceUIProps) {
  // T104: Full voice UI implementation with VoiceOrb component
  return (
    <div className="mx-auto w-full max-w-4xl p-4 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{jobTitle}</h1>
            <p className="text-muted-foreground">{company}</p>
            <p className="text-sm text-muted-foreground mt-2">Voice Mode</p>
          </div>
        </div>
      </div>

      {/* Voice UI Coming Soon */}
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Voice Mode</p>
        <p className="text-sm text-muted-foreground">
          T104: Voice Orb UI will be implemented next
        </p>
      </div>
    </div>
  );
}
