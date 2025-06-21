
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached?.data;
  }

  clearCache(): void {
    console.log('CacheManager: Clearing cache');
    this.cache.clear();
  }
}
