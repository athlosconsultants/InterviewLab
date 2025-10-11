import { useEffect, useState } from 'react';
import type { EntitlementSummary } from '@/lib/schema';

/**
 * T139 - Phase 13: Hook to fetch and track user entitlements
 * Provides remaining interview count and tier information
 */
export function useEntitlements() {
  const [summary, setSummary] = useState<EntitlementSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntitlements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/entitlements');

      if (!response.ok) {
        throw new Error('Failed to fetch entitlements');
      }

      const data = await response.json();
      setSummary(data);
      setError(null);
    } catch (err) {
      console.error('[T139] Error fetching entitlements:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntitlements();
  }, []);

  const hasRemainingInterviews = (summary?.remaining_interviews || 0) > 0;

  return {
    summary,
    isLoading,
    error,
    refetch: fetchEntitlements,
    hasRemainingInterviews,
    remainingCount: summary?.remaining_interviews || 0,
    tier: summary?.tier || null,
  };
}

