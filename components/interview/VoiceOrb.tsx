'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type OrbState = 'idle' | 'ready' | 'speaking' | 'listening' | 'processing';

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

  // T116: Updated processing state to muted grey
  const stateColors = {
    idle: 'bg-gradient-to-br from-primary/20 to-primary/40',
    ready: 'bg-gradient-to-br from-primary/20 to-primary/40', // Same as idle, awaiting input
    speaking: 'bg-gradient-to-br from-primary to-primary/60',
    listening: 'bg-gradient-to-br from-blue-500 to-blue-600',
    processing: 'bg-gradient-to-br from-gray-400 to-gray-500', // T116: Muted grey
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
                state === 'speaking' ? 'bg-primary/10' : 'bg-blue-500/10',
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
                state === 'speaking' ? 'bg-primary/5' : 'bg-blue-500/5',
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
              'animate-pulse-slow': state === 'processing', // T116: Slow pulse for processing
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
      <p className="text-sm font-medium text-muted-foreground">
        {state === 'idle' && 'Ready'}
        {state === 'ready' && 'Ready'}
        {state === 'speaking' && 'Speaking...'}
        {state === 'listening' && 'Listening...'}
        {state === 'processing' && 'Processing...'}
      </p>
    </div>
  );
}
