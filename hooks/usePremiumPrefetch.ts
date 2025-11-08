'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PrefetchOptions {
  sessionId?: string;
  enableCaching?: boolean;
}

/**
 * Premium Dashboard Prefetch Hook
 * Intelligently prefetches all pages accessible from premium dashboard
 * Includes cache management with 1-hour TTL
 */
export function usePremiumPrefetch({ sessionId, enableCaching = true }: PrefetchOptions = {}) {
  const router = useRouter();
  const prefetchedRef = useRef<boolean>(false);
  const cacheTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Prevent duplicate prefetching
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;

    // Core routes to prefetch
    const routes = [
      '/setup', // Interview setup
      '/dashboard/reports', // Reports list
      '/pricing', // Settings/upgrade
    ];

    // Add incomplete session route if exists
    if (sessionId) {
      routes.push(`/interview/${sessionId}`);
    }

    // Delay prefetch to not block initial render
    const prefetchTimer = setTimeout(() => {
      routes.forEach((route) => {
        // Use Next.js router prefetch (keeps resources in memory)
        router.prefetch(route);
        
        // Also add link prefetch hints for browser
        if (typeof document !== 'undefined') {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          link.as = 'document';
          document.head.appendChild(link);
        }
      });

      console.log('[Premium Prefetch] Preloaded', routes.length, 'routes');
    }, 500); // Wait 500ms after mount

    // Set up cache cleanup (1 hour)
    if (enableCaching) {
      cacheTimerRef.current = setTimeout(() => {
        // Clear Next.js router cache
        router.refresh();
        
        // Remove prefetch link hints
        if (typeof document !== 'undefined') {
          document.querySelectorAll('link[rel="prefetch"]').forEach((link) => {
            link.remove();
          });
        }
        
        console.log('[Premium Prefetch] Cache cleared after 1 hour');
        prefetchedRef.current = false; // Allow re-prefetch
      }, 60 * 60 * 1000); // 1 hour
    }

    return () => {
      clearTimeout(prefetchTimer);
      if (cacheTimerRef.current) {
        clearTimeout(cacheTimerRef.current);
      }
    };
  }, [router, sessionId, enableCaching]);
}

