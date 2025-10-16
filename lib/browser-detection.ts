/**
 * Detect if the user is in an in-app browser (TikTok, Instagram, Facebook, etc.)
 * These browsers often have issues with magic links and OAuth flows
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent.toLowerCase();

  // Check for common in-app browser patterns
  const inAppBrowserPatterns = [
    'fban', // Facebook App
    'fbav', // Facebook App
    'instagram', // Instagram
    'tiktok', // TikTok
    'snapchat', // Snapchat
    'line', // LINE
    'micromessenger', // WeChat
    'twitter', // Twitter/X
  ];

  return inAppBrowserPatterns.some((pattern) => ua.includes(pattern));
}

/**
 * Get a user-friendly browser name for display
 */
export function getInAppBrowserName(): string | null {
  if (typeof window === 'undefined') return null;

  const ua = window.navigator.userAgent.toLowerCase();

  if (ua.includes('fban') || ua.includes('fbav')) return 'Facebook';
  if (ua.includes('instagram')) return 'Instagram';
  if (ua.includes('tiktok')) return 'TikTok';
  if (ua.includes('snapchat')) return 'Snapchat';
  if (ua.includes('line')) return 'LINE';
  if (ua.includes('micromessenger')) return 'WeChat';
  if (ua.includes('twitter')) return 'Twitter/X';

  return 'in-app browser';
}
