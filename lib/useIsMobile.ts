'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * Returns an object with isMobile boolean and isReady flag
 *
 * @returns {{ isMobile: boolean; isReady: boolean }}
 */
export function useIsMobile(): { isMobile: boolean; isReady: boolean } {
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create a media query for mobile viewports
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    // Set initial value
    setIsMobile(mediaQuery.matches);
    setIsReady(true); // Mark as ready after first detection

    // Create event listener for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      console.log(
        '[useIsMobile] Viewport changed:',
        e.matches ? 'MOBILE' : 'DESKTOP'
      );
    };

    // Add listener (use newer addEventListener API)
    mediaQuery.addEventListener('change', handleChange);

    // Log initial detection
    console.log(
      '[useIsMobile] Initial detection:',
      mediaQuery.matches ? 'MOBILE' : 'DESKTOP'
    );

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isMobile, isReady };
}
