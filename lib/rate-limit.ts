/**
 * T142 - Rate Limiting System
 * In-memory LRU-based rate limiter for API abuse protection
 */

import { LRUCache } from 'lru-cache';

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class RateLimiter {
  private cache: LRUCache<string, number[]>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cache = new LRUCache({
      max: config.uniqueTokenPerInterval || 500,
      ttl: config.interval,
    });
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const tokenKey = `${identifier}`;
    
    const tokenCount = this.cache.get(tokenKey) || [];
    const validTokens = tokenCount.filter(
      (timestamp) => now - timestamp < this.config.interval
    );

    const isAllowed = validTokens.length < this.config.uniqueTokenPerInterval;

    if (isAllowed) {
      validTokens.push(now);
      this.cache.set(tokenKey, validTokens);
    }

    const oldestToken = validTokens[0] || now;
    const resetTime = oldestToken + this.config.interval;

    return {
      success: isAllowed,
      limit: this.config.uniqueTokenPerInterval,
      remaining: Math.max(
        0,
        this.config.uniqueTokenPerInterval - validTokens.length
      ),
      reset: Math.ceil(resetTime / 1000),
    };
  }
}

// Predefined rate limiters for different use cases
export const authRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 5, // 5 requests per minute
});

export const interviewRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10, // 10 submissions per minute
});

export const aiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 3, // 3 AI calls per minute per user
});

export const uploadRateLimiter = new RateLimiter({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 5, // 5 uploads per hour
});

/**
 * Helper function to apply rate limiting in API routes
 */
export async function checkRateLimit(
  identifier: string,
  limiter: RateLimiter
): Promise<RateLimitResult> {
  return limiter.check(identifier);
}

/**
 * Get client identifier from request (IP or user ID)
 */
export function getClientIdentifier(
  request: Request,
  userId?: string
): string {
  if (userId) return `user:${userId}`;
  
  // Try to get IP from various headers (for proxy/load balancer scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  
  return `ip:${ip}`;
}

