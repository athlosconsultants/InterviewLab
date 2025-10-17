'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * Returns true for screen width ≤ 768px
 *
 * @returns {boolean} - true if mobile viewport (≤768px), false otherwise
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Create a media query for mobile viewports
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    // Set initial value
    setIsMobile(mediaQuery.matches);

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

  return isMobile;
}
