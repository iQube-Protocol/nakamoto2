
import { KBAIKnowledgeItem, CacheEntry } from './types';

/**
 * Service to handle caching of KBAI knowledge items
 */
export class KBAICache {
  private cache: Map<string, CacheEntry<KBAIKnowledgeItem>> = new Map();
  private cacheLifetime: number;
  
  constructor(cacheLifetimeMs: number = 5 * 60 * 1000) { // Default: 5 minutes
    this.cacheLifetime = cacheLifetimeMs;
  }

  /**
   * Generate cache key from options object
   */
  public getCacheKey(options: Record<string, any>): string {
    return `kbai-${JSON.stringify(options)}`;
  }
  
  /**
   * Get cached data if it exists and is not expired
   */
  public getFromCache(key: string): KBAIKnowledgeItem[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheLifetime) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * Add data to cache
   */
  public addToCache(key: string, data: KBAIKnowledgeItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Clear all cached data
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Set cache lifetime
   */
  public setCacheLifetime(lifetimeMs: number): void {
    this.cacheLifetime = lifetimeMs;
  }
}
