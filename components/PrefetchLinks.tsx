'use client';

import { useEffect } from 'react';

/**
 * PrefetchLinks Component
 * Preloads critical pages when the landing page loads
 * Improves perceived performance by loading pages before user clicks
 */
export function PrefetchLinks() {
  useEffect(() => {
    // Prefetch critical pages after initial page load
    const prefetchPages = [
      '/sign-in',
      '/assessment/setup',
      '/pricing',
      '/setup',
    ];

    // Small delay to not block initial page render
    const timer = setTimeout(() => {
      prefetchPages.forEach((href) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = 'document';
        document.head.appendChild(link);
      });
    }, 1000); // Wait 1 second after page load

    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
