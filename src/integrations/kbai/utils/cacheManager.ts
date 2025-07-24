
import { KBAIKnowledgeItem, KBAIQueryOptions } from '../index';

/**
 * Cache manager for KBAI knowledge items
 */
export class CacheManager {
  private cache: Map<string, { data: KBAIKnowledgeItem[], timestamp: number }> = new Map();
  private cacheLifetime: number;
  
  constructor(cacheLifetime: number = 5 * 60 * 1000) { // Default 5 minutes
    this.cacheLifetime = cacheLifetime;
  }
  
  /**
   * Generate cache key from options
   */
  public getCacheKey(options: KBAIQueryOptions): string {
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
   * Clear the entire cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}
