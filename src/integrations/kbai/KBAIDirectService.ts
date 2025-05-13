
import { RetryService } from '@/services/RetryService';
import { EventSourcePolyfill } from 'event-source-polyfill';

// KBAI MCP server endpoint and credentials
const KBAI_MCP_ENDPOINT = 'https://api.kbai.org/MCP/sse';
const KBAI_AUTH_TOKEN = '85abed95769d4b2ea1cb6bfaa8a67193';
const KBAI_KB_TOKEN = 'KB00000001_CRPTMONDS';

export interface KBAIKnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: string;
  source: string;
  relevance: number;
  timestamp?: string;
}

export interface KBAIQueryOptions {
  query?: string;
  category?: string;
  limit?: number;
  includeMetadata?: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Service for direct communication with KBAI MCP server via SSE
 */
export class KBAIDirectService {
  private connectionStatus: ConnectionStatus = 'disconnected';
  private cache: Map<string, { data: KBAIKnowledgeItem[], timestamp: number }> = new Map();
  private cacheLifetime = 5 * 60 * 1000; // 5 minutes
  private readonly retryService: RetryService;
  
  constructor() {
    this.retryService = new RetryService({
      maxRetries: 3,
      baseDelay: 1000,
    });
  }

  /**
   * Get authentication headers for KBAI API requests
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-auth-token': KBAI_AUTH_TOKEN,
      'x-kb-token': KBAI_KB_TOKEN
    };
  }

  /**
   * Check if the KBAI API is healthy and accessible
   */
  public async checkApiHealth(): Promise<boolean> {
    try {
      this.connectionStatus = 'connecting';
      console.log('Checking KBAI API health...');
      
      const response = await fetch(KBAI_MCP_ENDPOINT, {
        method: 'OPTIONS',
        headers: this.getAuthHeaders()
      });
      
      const isHealthy = response.ok;
      this.connectionStatus = isHealthy ? 'connected' : 'error';
      
      console.log(`KBAI API health check: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
      return isHealthy;
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('KBAI health check failed:', error);
      return false;
    }
  }

  /**
   * Fetch knowledge items from KBAI MCP server
   */
  public async fetchKnowledgeItems(options: KBAIQueryOptions = {}): Promise<KBAIKnowledgeItem[]> {
    try {
      const cacheKey = this.getCacheKey(options);
      const cachedData = this.getFromCache(cacheKey);
      
      if (cachedData) {
        console.log('Using cached KBAI knowledge items:', cachedData);
        return cachedData;
      }
      
      this.connectionStatus = 'connecting';
      console.log('Fetching knowledge items from KBAI MCP server with options:', options);
      
      // Check API health first
      const isHealthy = await this.checkApiHealth();
      if (!isHealthy) {
        console.warn('KBAI API is not healthy, using fallback data');
        return this.getFallbackItems();
      }
      
      // Try to fetch items with retry logic
      const items = await this.retryService.execute(() => 
        this.connectToSSE(options)
      );
      
      if (!items || items.length === 0) {
        console.warn('No items returned from KBAI, using fallback data');
        return this.getFallbackItems();
      }
      
      this.connectionStatus = 'connected';
      
      // Cache the results
      this.addToCache(cacheKey, items);
      console.log('Successfully fetched and cached KBAI knowledge items:', items.length);
      
      return items;
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Failed to fetch KBAI knowledge:', error);
      return this.getFallbackItems();
    }
  }

  /**
   * Connect to the KBAI server using Server-Sent Events
   */
  private async connectToSSE(options: KBAIQueryOptions): Promise<KBAIKnowledgeItem[]> {
    return new Promise((resolve, reject) => {
      const { query = '', limit = 10, category = '' } = options;
      
      // Construct query string with parameters
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (limit) params.append('limit', limit.toString());
      if (category) params.append('category', category);
      
      const endpoint = `${KBAI_MCP_ENDPOINT}?${params.toString()}`;
      console.log('Connecting to SSE endpoint:', endpoint);
      
      // Use EventSource polyfill to support custom headers
      const eventSource = new EventSourcePolyfill(endpoint, {
        headers: this.getAuthHeaders()
      });
      
      const knowledgeItems: KBAIKnowledgeItem[] = [];
      const timeout = setTimeout(() => {
        if (eventSource.readyState !== eventSource.CLOSED) {
          console.log('SSE connection timed out, closing connection');
          eventSource.close();
          resolve(knowledgeItems.length > 0 ? knowledgeItems : this.getFallbackItems());
        }
      }, 15000); // 15 second timeout
      
      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received SSE message:', data);
          
          // Transform raw data into KBAIKnowledgeItem
          const item = this.transformKnowledgeItem(data);
          knowledgeItems.push(item);
          
          // If we've reached the limit, close connection and resolve
          if (knowledgeItems.length >= limit) {
            clearTimeout(timeout);
            eventSource.close();
            resolve(knowledgeItems);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        clearTimeout(timeout);
        eventSource.close();
        
        if (knowledgeItems.length > 0) {
          resolve(knowledgeItems); // Return partial results if available
        } else {
          reject(new Error('SSE connection failed'));
        }
      };
    });
  }

  /**
   * Transform raw knowledge item from KBAI format
   */
  private transformKnowledgeItem(item: any): KBAIKnowledgeItem {
    return {
      id: item.id || `kb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: item.title || item.name || 'Untitled Knowledge Item',
      content: item.content || item.text || item.description || '',
      type: item.type || 'general',
      source: item.source || 'KBAI',
      relevance: item.relevance || item.score || 0.5,
      timestamp: item.timestamp || new Date().toISOString()
    };
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Reset connection status and cache
   */
  public reset(): void {
    this.connectionStatus = 'disconnected';
    this.cache.clear();
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
let kbaiDirectServiceInstance: KBAIDirectService | null = null;

/**
 * Get the global KBAI direct service instance
 */
export const getKBAIDirectService = (): KBAIDirectService => {
  if (!kbaiDirectServiceInstance) {
    kbaiDirectServiceInstance = new KBAIDirectService();
  }
  return kbaiDirectServiceInstance;
};
