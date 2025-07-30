
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 30000; // 30 seconds cache TTL

  isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const isValid = Date.now() - cached.timestamp < this.TTL;
    if (!isValid) {
      this.cache.delete(key);
    }
    return isValid;
  }

  getCache<T>(key: string): T {
    const cached = this.cache.get(key);
    return cached?.data;
  }

  setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    console.log('CacheManager: Clearing all cached data');
    this.cache.clear();
  }

  clearCacheKey(key: string): void {
    console.log(`CacheManager: Clearing cache for key: ${key}`);
    this.cache.delete(key);
  }

  // Force refresh specific data types
  clearStatsCache(): void {
    this.clearCacheKey('unified-stats');
  }

  clearBatchCache(): void {
    this.clearCacheKey('batch-statuses');
    this.clearCacheKey('email-batches');
  }

  clearInvitationCache(): void {
    // Clear all pending email cache keys with different limits
    this.clearCacheKey('pending-emails-1000');
    this.clearCacheKey('pending-emails-10000');
    this.clearCacheKey('pending-emails-50000');
    this.clearCacheKey('emails-sent');
    this.clearCacheKey('awaiting-signup');
    this.clearCacheKey('completed-invitations');
  }
}
