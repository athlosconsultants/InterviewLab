'use client';

import { cn } from '@/lib/utils';

interface ScoreDialProps {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreDial({ score, grade, size = 'lg' }: ScoreDialProps) {
  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-32 w-32',
    lg: 'h-40 w-40',
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const radius = size === 'sm' ? 36 : size === 'md' ? 52 : 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Design system colors
  const gradeColors = {
    A: 'text-cyan-600',
    B: 'text-blue-600',
    C: 'text-blue-500',
    D: 'text-slate-600',
    F: 'text-red-500',
  };

  const gradeColorStrokes = {
    A: '#0891b2', // cyan-600
    B: '#2563eb', // blue-600
    C: '#3b82f6', // blue-500
    D: '#475569', // slate-600
    F: '#ef4444', // red-500
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizeClasses[size])}>
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox={`0 0 ${radius * 2 + 20} ${radius * 2 + 20}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-200"
          />
          {/* Progress circle */}
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={gradeColorStrokes[grade]}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-bold',
              textSizeClasses[size],
              gradeColors[grade]
            )}
          >
            {Math.round(score)}
          </span>
          <span className="text-xs text-slate-600 font-medium">/ 100</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-3xl font-bold px-4 py-1 rounded-xl',
            gradeColors[grade]
          )}
        >
          {grade}
        </span>
      </div>
    </div>
  );
}
