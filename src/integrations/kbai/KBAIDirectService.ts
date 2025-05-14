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
  private maxConnectionAttempts = 3; // Reduced number of attempts before falling back
  private lastConnectionAttempt = 0;
  private connectionCooldown = 10000; // 10 seconds between connection attempts
  private useFallbackMode = false; // Flag to indicate if we should use fallback mode
  
  constructor() {
    this.cacheManager = new CacheManager();
    this.retryService = new RetryService({
      maxRetries: 2, // Reduced number of retries
      baseDelay: 1000,
      maxDelay: 5000, // Reduced max delay
      exponentialFactor: 1.5,
      retryCondition: (error: any) => {
        // Don't retry on authentication errors or if we're in fallback mode
        if (error.status === 401 || error.status === 403 || this.useFallbackMode) {
          return false;
        }
        return true;
      }
    });
  }

  /**
   * Get authentication headers for KBAI API requests
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'x-auth-token': KBAI_AUTH_TOKEN,
      'x-kb-token': KBAI_KB_TOKEN
    };
  }

  /**
   * Check if the KBAI API is healthy and accessible
   * @param forceCheck Force a check even if one was recently performed
   */
  public async checkApiHealth(forceCheck = false): Promise<boolean> {
    try {
      if (this.useFallbackMode) {
        console.log('In fallback mode, skipping health check');
        return false;
      }
      
      const now = Date.now();
      
      // Don't check too frequently unless forced
      if (!forceCheck && now - this.lastConnectionAttempt < this.connectionCooldown) {
        console.log(`Skipping health check - cool down period (${Math.round((now - this.lastConnectionAttempt) / 1000)}s < ${this.connectionCooldown / 1000}s)`);
        return this.connectionStatus === 'connected'; // Return current status
      }
      
      this.lastConnectionAttempt = now;
      this.connectionStatus = 'connecting';
      
      console.log(`Performing KBAI API health check at ${new Date().toISOString()}`);
      
      const isHealthy = await checkApiHealth(KBAI_MCP_ENDPOINT, this.getAuthHeaders());
      
      this.connectionStatus = isHealthy ? 'connected' : 'error';
      console.log(`KBAI health check result: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      
      // If not healthy and we've tried enough times, enter fallback mode
      if (!isHealthy && this.connectionAttempts >= this.maxConnectionAttempts) {
        console.log(`Entering fallback mode after ${this.connectionAttempts} failed attempts`);
        this.useFallbackMode = true;
        
        // Show toast only once when entering fallback mode
        toast.info('Using offline knowledge base', {
          description: 'Unable to connect to KBAI server, using cached data'
        });
      }
      
      return isHealthy;
    } catch (error) {
      console.error('KBAI health check error:', error);
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
      
      // If we're in fallback mode or have cache and not forcing refresh, use cache/fallback
      if ((this.useFallbackMode || cachedData) && options.query !== 'force-refresh') {
        if (cachedData) {
          console.log('Using cached KBAI knowledge items:', cachedData);
          return cachedData;
        } else {
          console.log('In fallback mode, using fallback data');
          return getFallbackItems(options.query || '');
        }
      }
      
      // Reset fallback mode if we're doing a force refresh
      if (options.query === 'force-refresh') {
        this.useFallbackMode = false;
        this.connectionAttempts = 0;
      }
      
      this.connectionStatus = 'connecting';
      console.log('Fetching knowledge items from KBAI MCP server with options:', options);
      
      // Increment connection attempts
      this.connectionAttempts++;
      console.log(`KBAI connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
      
      const isHealthy = await this.checkApiHealth(true);
      
      if (!isHealthy) {
        console.warn('KBAI API is not healthy, using fallback data');
        
        // If we have cache, use it as primary fallback
        if (cachedData) {
          return cachedData;
        }
        
        // Otherwise use generated fallback data
        return getFallbackItems(options.query || '');
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
          return getFallbackItems(options.query || '');
        }
        
        this.connectionStatus = 'connected';
        this.connectionAttempts = 0; // Reset connection attempts on success
        this.useFallbackMode = false; // Exit fallback mode on success
        
        // Cache the results
        this.cacheManager.addToCache(cacheKey, items);
        console.log('Successfully fetched and cached KBAI knowledge items:', items.length);
        
        return items;
      } catch (sseError) {
        console.error('SSE connection error:', sseError);
        this.connectionStatus = 'error';
        
        if (cachedData) {
          return cachedData;
        }
        return getFallbackItems(options.query || '');
      }
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Failed to fetch KBAI knowledge:', error);
      
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        this.useFallbackMode = true;
      }
      
      // Try to return cache if available
      const cacheKey = this.cacheManager.getCacheKey(options);
      const cachedData = this.cacheManager.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      return getFallbackItems(options.query || '');
    }
  }

  /**
   * Force refresh connection and cache
   */
  public async forceRefresh(): Promise<boolean> {
    try {
      console.log('Force refreshing KBAI connection');
      this.cacheManager.clearCache();
      this.connectionAttempts = 0;
      this.lastConnectionAttempt = 0;
      this.useFallbackMode = false; // Exit fallback mode
      
      // Force health check
      const isHealthy = await this.checkApiHealth(true);
      
      if (isHealthy) {
        toast.success('Successfully connected to knowledge base', {
          description: 'Your connection has been refreshed'
        });
      } else {
        toast.info('Using offline knowledge base', {
          description: 'Unable to connect to KBAI server, using local data'
        });
      }
      
      return isHealthy;
    } catch (error) {
      console.error('Force refresh failed:', error);
      toast.error('Connection refresh failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if service is in fallback mode
   */
  public isInFallbackMode(): boolean {
    return this.useFallbackMode;
  }

  /**
   * Reset connection status and cache
   */
  public reset(): void {
    this.connectionStatus = 'disconnected';
    this.connectionAttempts = 0;
    this.lastConnectionAttempt = 0;
    this.useFallbackMode = false;
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
