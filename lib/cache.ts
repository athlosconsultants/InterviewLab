/**
 * T98 - Server-side caching for research snapshots
 * Purpose: Cache role+company research to avoid redundant API calls
 * TTL: 24 hours
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ServerCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.cache = new Map();
    // Optional: Periodic cleanup of expired entries
    this.startCleanup();
  }

  /**
   * Generate cache key from role and company name
   */
  private generateKey(role: string, company: string): string {
    const normalizedRole = role.toLowerCase().trim();
    const normalizedCompany = company.toLowerCase().trim();
    return `research:${normalizedRole}:${normalizedCompany}`;
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(role: string, company: string): T | null {
    const key = this.generateKey(role, company);
    const entry = this.cache.get(key);

    if (!entry) {
      console.log(`[Cache MISS] ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      console.log(`[Cache EXPIRED] ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache HIT] ${key}`);
    return entry.data as T;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(role: string, company: string, data: T, ttlMs?: number): void {
    const key = this.generateKey(role, company);
    const ttl = ttlMs || this.DEFAULT_TTL_MS;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, { data, expiresAt });
    console.log(`[Cache SET] ${key} (TTL: ${ttl / 1000 / 60 / 60}h)`);
  }

  /**
   * Invalidate cached entry
   */
  invalidate(role: string, company: string): void {
    const key = this.generateKey(role, company);
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[Cache INVALIDATE] ${key}`);
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[Cache CLEAR] Removed ${size} entries`);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Periodic cleanup of expired entries (runs every hour)
   */
  private startCleanup(): void {
    setInterval(
      () => {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.cache.entries()) {
          if (now > entry.expiresAt) {
            this.cache.delete(key);
            cleaned++;
          }
        }

        if (cleaned > 0) {
          console.log(`[Cache CLEANUP] Removed ${cleaned} expired entries`);
        }
      },
      60 * 60 * 1000
    ); // Run every hour
  }
}

// Singleton instance
export const researchCache = new ServerCache();
