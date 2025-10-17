/**
 * User Agent Detection Utilities
 *
 * Server-side utilities for detecting mobile devices and browsers
 * from the User-Agent header in middleware.
 */

/**
 * Detect if the user agent is a mobile device
 *
 * @param userAgent - The User-Agent header string
 * @returns true if mobile device detected
 */
export function isMobileUserAgent(userAgent: string): boolean {
  if (!userAgent) return false;

  const ua = userAgent.toLowerCase();

  // Mobile device patterns
  const mobilePatterns = [
    /android/i,
    /webos/i,
    /iphone/i,
    /ipad/i,
    /ipod/i,
    /blackberry/i,
    /windows phone/i,
    /mobile/i,
  ];

  return mobilePatterns.some((pattern) => pattern.test(ua));
}

/**
 * Detect if the user agent is a tablet
 *
 * @param userAgent - The User-Agent header string
 * @returns true if tablet detected
 */
export function isTabletUserAgent(userAgent: string): boolean {
  if (!userAgent) return false;

  const ua = userAgent.toLowerCase();

  // Tablet patterns (but not phones)
  const tabletPatterns = [
    /ipad/i,
    /android(?!.*mobile)/i, // Android tablet (has "android" but not "mobile")
    /tablet/i,
  ];

  return tabletPatterns.some((pattern) => pattern.test(ua));
}

/**
 * Get device type from user agent
 *
 * @param userAgent - The User-Agent header string
 * @returns 'mobile', 'tablet', or 'desktop'
 */
export function getDeviceType(
  userAgent: string
): 'mobile' | 'tablet' | 'desktop' {
  if (isTabletUserAgent(userAgent)) return 'tablet';
  if (isMobileUserAgent(userAgent)) return 'mobile';
  return 'desktop';
}
