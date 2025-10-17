'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEntitlements } from '@/hooks/useEntitlements';

/**
 * T139 - Phase 13: Entitlement Counter Badge
 * Displays remaining interviews in header/navbar
 */
export function EntitlementBadge() {
  const router = useRouter();
  const { remainingCount, tier, isLoading } = useEntitlements();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (remainingCount === 0) {
    // Zero balance - prompt to purchase
    return (
      <Button
        size="sm"
        onClick={() => router.push('/pricing')}
        className="gap-1 md:gap-2 px-2 md:px-4"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Buy Interviews</span>
        <span className="sm:hidden">Buy</span>
      </Button>
    );
  }

  // Has remaining interviews
  const tierColor = {
    elite:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    professional:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    starter:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  };

  const color = tier ? tierColor[tier] : 'bg-muted text-muted-foreground';

  return (
    <div
      className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded-full ${color} cursor-pointer transition-transform hover:scale-105`}
      onClick={() => router.push('/pricing')}
    >
      <Sparkles className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm font-semibold whitespace-nowrap">
        <span className="hidden sm:inline">
          {remainingCount} {remainingCount === 1 ? 'interview' : 'interviews'}
        </span>
        <span className="sm:hidden">{remainingCount}</span>
      </span>
    </div>
  );
}
