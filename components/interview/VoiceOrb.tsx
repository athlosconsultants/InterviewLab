'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type OrbState = 'idle' | 'ready' | 'speaking' | 'listening' | 'thinking';

interface VoiceOrbProps {
  state: OrbState;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceOrb({ state, size = 'lg' }: VoiceOrbProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (state === 'speaking' || state === 'listening') {
      const interval = setInterval(() => {
        setPulse((prev) => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [state]);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  // Design system colors - matching design.json voiceOrb states
  const stateColors = {
    idle: 'bg-gradient-to-[135deg] from-cyan-500/20 to-blue-600/40',
    ready: 'bg-gradient-to-[135deg] from-cyan-500/20 to-blue-600/40',
    speaking: 'bg-gradient-to-[135deg] from-cyan-500 to-cyan-600',
    listening: 'bg-gradient-to-[135deg] from-blue-500 to-blue-600',
    thinking: 'bg-gradient-to-[135deg] from-slate-400 to-slate-500',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Orb container */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow rings */}
        {(state === 'speaking' || state === 'listening') && (
          <>
            <div
              className={cn(
                'absolute rounded-full',
                sizeClasses[size],
                state === 'speaking' ? 'bg-cyan-500/10' : 'bg-blue-500/10',
                'animate-ping'
              )}
              style={{
                width: `calc(${sizeClasses[size].split(' ')[0].replace('w-', '')} * 1.5)`,
                height: `calc(${sizeClasses[size].split(' ')[1].replace('h-', '')} * 1.5)`,
              }}
            />
            <div
              className={cn(
                'absolute rounded-full',
                sizeClasses[size],
                state === 'speaking' ? 'bg-cyan-500/5' : 'bg-blue-500/5',
                'animate-pulse'
              )}
              style={{
                width: `calc(${sizeClasses[size].split(' ')[0].replace('w-', '')} * 1.8)`,
                height: `calc(${sizeClasses[size].split(' ')[1].replace('h-', '')} * 1.8)`,
              }}
            />
          </>
        )}

        {/* Main orb */}
        <div
          className={cn(
            'relative rounded-full shadow-2xl transition-all duration-300',
            sizeClasses[size],
            stateColors[state],
            {
              'scale-100': state === 'idle' || state === 'ready',
              'scale-105': state === 'speaking',
              'scale-110': state === 'listening',
              'animate-pulse-slow': state === 'thinking', // T125: Slow pulse for thinking
            }
          )}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/20 to-transparent" />

          {/* Pulse effect */}
          {(state === 'speaking' || state === 'listening') && (
            <div
              className="absolute inset-0 rounded-full bg-white/10"
              style={{
                transform: `scale(${1 + (pulse / 100) * 0.2})`,
                opacity: 1 - pulse / 100,
              }}
            />
          )}
        </div>
      </div>

      {/* State indicator - below the orb */}
      <p className="text-sm font-medium text-slate-600">
        {state === 'idle' && 'Ready'}
        {state === 'ready' && 'Ready'}
        {state === 'speaking' && 'Speaking...'}
        {state === 'listening' && 'Listening...'}
        {state === 'thinking' && 'Thinking...'}
      </p>
    </div>
  );
}
