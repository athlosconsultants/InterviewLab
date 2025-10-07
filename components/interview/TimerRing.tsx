'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerRingProps {
  timeLimit: number; // Time limit in seconds
  onExpire?: () => void; // Callback when timer expires
  startTime: string; // ISO timestamp when question started
}

export function TimerRing({ timeLimit, onExpire, startTime }: TimerRingProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    // Calculate initial time remaining based on start time
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - start) / 1000);
    const remaining = Math.max(0, timeLimit - elapsed);

    setTimeRemaining(remaining);

    if (remaining <= 0 && onExpire) {
      onExpire();
      return;
    }

    // Update timer every second
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, startTime, onExpire]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate percentage for ring progress
  const percentage = (timeRemaining / timeLimit) * 100;

  // Determine color based on time remaining
  const getColor = () => {
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStrokeColor = () => {
    if (percentage > 50) return 'stroke-green-600';
    if (percentage > 25) return 'stroke-yellow-600';
    return 'stroke-red-600';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG Ring */}
      <svg className="h-16 w-16 -rotate-90 transform">
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 28}`}
          strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
          className={`transition-all duration-1000 ${getStrokeColor()}`}
          strokeLinecap="round"
        />
      </svg>

      {/* Time Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Clock className={`h-4 w-4 ${getColor()}`} />
        <span className={`text-xs font-bold ${getColor()}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
}
