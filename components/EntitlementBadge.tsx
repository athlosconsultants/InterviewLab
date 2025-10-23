'use client';

import { Clock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TimeRemaining {
  isActive: boolean;
  tier: string | null;
  expiresAt: string | null;
  timeRemaining: string | null;
}

/**
 * Entitlement Badge - Time-based Access Pass System
 * Displays remaining time in header/navbar
 */
export function EntitlementBadge() {
  const router = useRouter();
  const [entitlement, setEntitlement] = useState<TimeRemaining | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEntitlement() {
      try {
        const response = await fetch('/api/entitlements');
        if (response.ok) {
          const data = await response.json();

          let timeRemaining = null;
          if (data.isActive && data.expiresAt) {
            const now = new Date();
            const expires = new Date(data.expiresAt);
            const diffMs = expires.getTime() - now.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(
              (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );

            if (diffDays > 0) {
              timeRemaining = `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
            } else if (diffHours > 0) {
              timeRemaining = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
            } else {
              timeRemaining = 'Less than 1 hour';
            }
          } else if (data.isActive && !data.expiresAt) {
            // Lifetime pass
            timeRemaining = 'Lifetime';
          }

          setEntitlement({
            isActive: data.isActive,
            tier: data.tier,
            expiresAt: data.expiresAt,
            timeRemaining,
          });
        }
      } catch (error) {
        console.error('Failed to fetch entitlement:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntitlement();
    // Refresh every minute
    const interval = setInterval(fetchEntitlement, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Loading...
        </span>
      </div>
    );
  }

  if (!entitlement?.isActive) {
    // No active pass - prompt to purchase
    return (
      <Button
        size="sm"
        onClick={() => router.push('/pricing')}
        className="gap-1 md:gap-2 px-2 md:px-4 bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] hover:shadow-lg"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Get Access Pass</span>
        <span className="sm:hidden">Get Pass</span>
      </Button>
    );
  }

  // Has active pass - show time remaining
  return (
    <div
      className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded-full bg-gradient-to-r from-[#3E8BFF]/10 to-[#3DCBFF]/10 border border-[#3E8BFF]/20 cursor-pointer transition-all hover:shadow-md hover:scale-105"
      onClick={() => router.push('/pricing')}
    >
      <Clock className="h-4 w-4 flex-shrink-0 text-[#3E8BFF]" />
      <span className="text-sm font-semibold whitespace-nowrap bg-gradient-to-r from-[#3E8BFF] to-[#3DCBFF] bg-clip-text text-transparent">
        <span className="hidden sm:inline">
          {entitlement.timeRemaining} remaining
        </span>
        <span className="sm:hidden">{entitlement.timeRemaining}</span>
      </span>
    </div>
  );
}
