
import { toast } from 'sonner';
import { KBAIKnowledgeItem, KBAIQueryOptions, ConnectionStatus, getKBAIDirectService } from './index';
import { getFallbackItems } from './utils/fallbackData';
import { CacheManager } from './utils/cacheManager';

/**
 * Service for communicating with KBAI MCP server via direct API connection
 */
export class KBAIMCPService {
  private connectionStatus: ConnectionStatus = 'disconnected';
  private readonly cacheManager: CacheManager;
  private lastErrorTime: number = 0;
  private errorCooldown: number = 30000; // 30 second cooldown between error notifications
  
  constructor() {
    this.cacheManager = new CacheManager();
  }

  /**
   * Fetch knowledge items from KBAI MCP server
   */
  async fetchKnowledgeItems(options: KBAIQueryOptions = {}): Promise<KBAIKnowledgeItem[]> {
    try {
      const cacheKey = this.cacheManager.getCacheKey(options);
      const cachedData = this.cacheManager.getFromCache(cacheKey);
      
      if (cachedData) {
        console.log('Using cached KBAI knowledge items:', cachedData);
        return cachedData;
      }
      
      this.connectionStatus = 'connecting';
      console.log('Fetching knowledge items from KBAI MCP server with options:', options);
      
      // Use the direct KBAI service instead of Supabase edge function
      const directService = getKBAIDirectService();
      const items = await directService.fetchKnowledgeItems(options);
      
      // Update our connection status based on the direct service
      this.connectionStatus = directService.getConnectionStatus();
      
      if (!items || items.length === 0) {
        console.warn('No items returned from KBAI, using fallback items');
        return getFallbackItems();
      }
      
      // Cache the results
      this.cacheManager.addToCache(cacheKey, items);
      console.log('Successfully fetched and cached KBAI knowledge items:', items.length);
      
      return items;
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Failed to fetch KBAI knowledge:', error);
      
      // Only show toast error if we haven't shown one recently
      const now = Date.now();
      if (now - this.lastErrorTime > this.errorCooldown) {
        this.lastErrorTime = now;
        toast.error('Failed to connect to knowledge base', {
          description: 'Using fallback knowledge items instead'
        });
      }
      
      return getFallbackItems();
    }
  }
  
  /**
   * Get connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }
  
  /**
   * Reset connection status and cache
   */
  reset(): void {
    this.connectionStatus = 'disconnected';
    this.cacheManager.clearCache();
    
    // Also reset the direct service
    const directService = getKBAIDirectService();
    directService.reset();
  }
}

// Singleton instance for use throughout the app
let kbaiServiceInstance: KBAIMCPService | null = null;

/**
 * Get the global KBAI service instance
 */
export const getKBAIService = (): KBAIMCPService => {
  if (!kbaiServiceInstance) {
    kbaiServiceInstance = new KBAIMCPService();
  }
  return kbaiServiceInstance;
};
