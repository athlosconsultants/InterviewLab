'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { loadDraft, clearDraft, getDraftAge, type InterviewDraft } from '@/utils/draftManager';
import { Clock, X } from 'lucide-react';

interface DraftRecoveryBannerProps {
  onRestore: (draft: InterviewDraft) => void;
}

export function DraftRecoveryBanner({ onRestore }: DraftRecoveryBannerProps) {
  const [draft, setDraft] = useState<InterviewDraft | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const existingDraft = loadDraft();
    if (existingDraft) {
      setDraft(existingDraft);
      setIsVisible(true);
    }
  }, []);

  const handleRestore = () => {
    if (draft) {
      onRestore(draft);
      setIsVisible(false);
    }
  };

  const handleStartFresh = () => {
    clearDraft();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Keep draft in storage - user may change their mind
  };

  if (!isVisible || !draft) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">
            Draft Saved
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            We saved your interview setup from <strong>{getDraftAge(draft)}</strong>.
            Would you like to continue where you left off?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRestore}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Restore Draft
            </Button>
            <Button
              onClick={handleStartFresh}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Start Fresh
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

