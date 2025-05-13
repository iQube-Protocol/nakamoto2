import { toast } from 'sonner';
import { getKBAIDirectService } from './index';

export interface KBAIKnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: string;
  source: string;
  relevance: number;
  timestamp: string;
}

export interface KBAIQueryOptions {
  query?: string;
  category?: string;
  limit?: number;
  includeMetadata?: boolean;
}

/**
 * Service for communicating with KBAI MCP server via direct API connection
 */
export class KBAIMCPService {
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private cache: Map<string, { data: KBAIKnowledgeItem[], timestamp: number }> = new Map();
  private cacheLifetime = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch knowledge items from KBAI MCP server
   */
  async fetchKnowledgeItems(options: KBAIQueryOptions = {}): Promise<KBAIKnowledgeItem[]> {
    try {
      const cacheKey = this.getCacheKey(options);
      const cachedData = this.getFromCache(cacheKey);
      
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
        return this.getFallbackItems();
      }
      
      // Cache the results
      this.addToCache(cacheKey, items);
      console.log('Successfully fetched and cached KBAI knowledge items:', items.length);
      
      return items;
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Failed to fetch KBAI knowledge:', error);
      toast.error('Failed to connect to knowledge base', {
        description: 'Using fallback knowledge items instead'
      });
      
      return this.getFallbackItems();
    }
  }
  
  /**
   * Get connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.connectionStatus;
  }
  
  /**
   * Reset connection status and cache
   */
  reset(): void {
    this.connectionStatus = 'disconnected';
    this.cache.clear();
    
    // Also reset the direct service
    const directService = getKBAIDirectService();
    directService.reset();
  }
  
  /**
   * Get fallback knowledge items when KBAI is unavailable
   */
  private getFallbackItems(): KBAIKnowledgeItem[] {
    return [
      {
        id: 'fallback-1',
        title: 'Introduction to Web3',
        content: 'Web3 represents the next evolution of the internet, focusing on decentralization, blockchain technology, and token-based economics.',
        type: 'concept',
        source: 'Local',
        relevance: 0.9,
        timestamp: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        title: 'Smart Contracts',
        content: 'Smart contracts are self-executing contracts with the terms directly written into code. They automatically execute when predetermined conditions are met.',
        type: 'concept',
        source: 'Local',
        relevance: 0.8,
        timestamp: new Date().toISOString()
      },
      {
        id: 'fallback-3',
        title: 'Cryptocurrency Basics',
        content: 'Cryptocurrencies are digital or virtual currencies that use cryptography for security and operate on decentralized networks based on blockchain technology.',
        type: 'guide',
        source: 'Local',
        relevance: 0.7,
        timestamp: new Date().toISOString()
      }
    ];
  }
  
  /**
   * Generate cache key from options
   */
  private getCacheKey(options: KBAIQueryOptions): string {
    return `kbai-${JSON.stringify(options)}`;
  }
  
  /**
   * Get cached data if it exists and is not expired
   */
  private getFromCache(key: string): KBAIKnowledgeItem[] | null {
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
  private addToCache(key: string, data: KBAIKnowledgeItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
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
