import { clearPremiumCache } from '@/hooks/usePremiumDataPrefetch';

/**
 * Cache Manager
 * Handles cache invalidation on key events
 */

/**
 * Clear cache when user completes an interview
 */
export function invalidateCacheOnInterviewComplete() {
  clearPremiumCache();
  console.log('[Cache Manager] Invalidated cache: interview completed');
}

/**
 * Clear cache on logout
 */
export function invalidateCacheOnLogout() {
  clearPremiumCache();
  console.log('[Cache Manager] Invalidated cache: user logged out');
}

/**
 * Clear cache when user uploads CV
 */
export function invalidateCacheOnCvUpload() {
  clearPremiumCache();
  console.log('[Cache Manager] Invalidated cache: CV uploaded');
}

/**
 * Clear cache on any user data change
 */
export function invalidateCacheOnDataChange() {
  clearPremiumCache();
  console.log('[Cache Manager] Invalidated cache: data changed');
}

