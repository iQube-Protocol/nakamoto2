
import { RetryService } from '@/services/RetryService';
import { KBAIKnowledgeItem, KBAIQueryOptions, ConnectionStatus } from './index';
import { connectToSSE, checkApiHealth } from './utils/sseConnection';
import { getFallbackItems } from './utils/fallbackData';
import { CacheManager } from './utils/cacheManager';
import { toast } from 'sonner';

// KBAI MCP server endpoint and credentials
const KBAI_MCP_ENDPOINT = 'https://api.kbai.org/MCP/sse';
const KBAI_AUTH_TOKEN = '85abed95769d4b2ea1cb6bfaa8a67193';
const KBAI_KB_TOKEN = 'KB00000001_CRPTMONDS';

/**
 * Service for direct communication with KBAI MCP server via SSE
 */
export class KBAIDirectService {
  private connectionStatus: ConnectionStatus = 'disconnected';
  private readonly cacheManager: CacheManager;
  private readonly retryService: RetryService;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  
  constructor() {
    this.cacheManager = new CacheManager();
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
      'x-kb-token': KBAI_KB_TOKEN,
      'Origin': window.location.origin,
      'Accept': 'text/event-stream'
    };
  }

  /**
   * Check if the KBAI API is healthy and accessible
   */
  public async checkApiHealth(): Promise<boolean> {
    try {
      this.connectionStatus = 'connecting';
      const isHealthy = await checkApiHealth(KBAI_MCP_ENDPOINT, this.getAuthHeaders());
      this.connectionStatus = isHealthy ? 'connected' : 'error';
      return isHealthy;
    } catch (error) {
      this.connectionStatus = 'error';
      return false;
    }
  }

  /**
   * Fetch knowledge items from KBAI MCP server
   */
  public async fetchKnowledgeItems(options: KBAIQueryOptions = {}): Promise<KBAIKnowledgeItem[]> {
    try {
      const cacheKey = this.cacheManager.getCacheKey(options);
      const cachedData = this.cacheManager.getFromCache(cacheKey);
      
      if (cachedData) {
        console.log('Using cached KBAI knowledge items:', cachedData);
        return cachedData;
      }
      
      this.connectionStatus = 'connecting';
      console.log('Fetching knowledge items from KBAI MCP server with options:', options);
      
      // Reset connection attempts for this fetch operation
      this.connectionAttempts = 0;
      
      // Try to connect with multiple attempts before falling back
      let isHealthy = false;
      
      while (this.connectionAttempts < this.maxConnectionAttempts && !isHealthy) {
        this.connectionAttempts++;
        console.log(`KBAI connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
        
        isHealthy = await this.checkApiHealth();
        
        if (!isHealthy && this.connectionAttempts < this.maxConnectionAttempts) {
          // Wait before trying again with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts - 1), 5000);
          console.log(`Waiting ${delay}ms before next connection attempt`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      if (!isHealthy) {
        console.warn('KBAI API is not healthy after multiple attempts, using fallback data');
        toast.error('Could not connect to knowledge base', {
          description: 'Using fallback knowledge items instead'
        });
        return getFallbackItems();
      }
      
      // Try connecting with retry logic for the SSE connection
      try {
        const items = await this.retryService.execute(() => 
          connectToSSE({
            endpoint: KBAI_MCP_ENDPOINT,
            headers: this.getAuthHeaders(),
            ...options
          })
        );
        
        if (!items || items.length === 0) {
          console.warn('No items returned from KBAI, using fallback data');
          return getFallbackItems();
        }
        
        this.connectionStatus = 'connected';
        
        // Cache the results
        this.cacheManager.addToCache(cacheKey, items);
        console.log('Successfully fetched and cached KBAI knowledge items:', items.length);
        
        return items;
      } catch (sseError) {
        console.error('SSE connection error:', sseError);
        this.connectionStatus = 'error';
        return getFallbackItems();
      }
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Failed to fetch KBAI knowledge:', error);
      return getFallbackItems();
    }
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
    this.connectionAttempts = 0;
    this.cacheManager.clearCache();
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
