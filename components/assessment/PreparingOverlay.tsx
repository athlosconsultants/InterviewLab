'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PreparingOverlayProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number; // Duration in milliseconds (default: 2000ms)
}

/**
 * T31: PreparingOverlay component
 * Shows a brief "Preparing your interview..." overlay for 2 seconds
 * to create anticipation and smooth transition between setup and interview
 */
export function PreparingOverlay({
  show,
  onComplete,
  duration = 2000,
}: PreparingOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) {
      setProgress(0);
      return;
    }

    // Animate progress bar
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 100); // Small delay before callback
        }
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [show, duration, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex flex-col items-center space-y-6 px-4">
        {/* Animated loader */}
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-cyan-200 dark:border-cyan-800"></div>
          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-cyan-600 dark:border-t-cyan-400"></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400" />
        </div>

        {/* Message */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Preparing Your Interview
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Setting up your personalized assessment...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtle hint */}
        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs text-center">
          This usually takes just a moment
        </p>
      </div>
    </div>
  );
}
