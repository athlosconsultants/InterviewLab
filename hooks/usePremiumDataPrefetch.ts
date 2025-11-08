'use client';

import { useEffect } from 'react';

interface CachedData {
  data: any;
  timestamp: number;
}

const CACHE_KEY_PREFIX = 'premium_cache_';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Premium API Data Prefetch Hook
 * Prefetches and caches API data for faster page loads
 */
export function usePremiumDataPrefetch() {
  useEffect(() => {
    const prefetchAndCache = async () => {
      try {
        // Prefetch sessions/reports data
        const sessionsResponse = await fetch('/api/user/sessions');
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          cacheData('sessions', sessionsData);
        }

        console.log('[Premium Data Prefetch] API data cached');
      } catch (error) {
        console.error('[Premium Data Prefetch] Failed:', error);
      }
    };

    // Delay to not block initial render
    const timer = setTimeout(prefetchAndCache, 1000);

    // Set up automatic cache cleanup
    const cleanupTimer = setTimeout(() => {
      clearExpiredCache();
      console.log('[Premium Data Prefetch] Expired cache cleared');
    }, CACHE_TTL);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanupTimer);
    };
  }, []);
}

/**
 * Cache data with timestamp
 */
function cacheData(key: string, data: any) {
  try {
    const cacheEntry: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('[Cache] Failed to cache data:', error);
  }
}

/**
 * Get cached data if not expired
 */
export function getCachedData(key: string): any | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;

    const cacheEntry: CachedData = JSON.parse(cached);
    const age = Date.now() - cacheEntry.timestamp;

    // Return data if not expired
    if (age < CACHE_TTL) {
      return cacheEntry.data;
    }

    // Remove expired cache
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
    return null;
  } catch (error) {
    console.warn('[Cache] Failed to read cache:', error);
    return null;
  }
}

/**
 * Clear all expired cache entries
 */
function clearExpiredCache() {
  try {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const cacheEntry: CachedData = JSON.parse(cached);
          const age = now - cacheEntry.timestamp;
          if (age >= CACHE_TTL) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  } catch (error) {
    console.warn('[Cache] Failed to clear expired cache:', error);
  }
}

/**
 * Clear all premium cache (use on logout or significant updates)
 */
export function clearPremiumCache() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => localStorage.removeItem(key));
    console.log('[Cache] Cleared', keys.length, 'premium cache entries');
  } catch (error) {
    console.warn('[Cache] Failed to clear cache:', error);
  }
}

