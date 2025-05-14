import { RetryService } from '@/services/RetryService';
import { KBAIKnowledgeItem, KBAIQueryOptions, ConnectionStatus } from './index';
import { connectToSSE, checkApiHealth } from './utils/sseConnection';
import { getFallbackItems } from './utils/fallbackData';
import { CacheManager } from './utils/cacheManager';
import { toast } from 'sonner';

// KBAI MCP server endpoint and credentials
// Using more compatible server endpoints
const KBAI_MCP_ENDPOINTS = [
  'https://api.kbai.org/MCP/sse',  // Primary endpoint
  'https://kbai-api.metame.io/sse', // Backup endpoint
  'https://kbai-mcp.vercel.app/api/sse' // Fallback endpoint
];
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
  private maxConnectionAttempts = 1; // Reduced to 1 to prevent continuous retrying
  private lastConnectionAttempt = 0;
  private connectionCooldown = 5000; // Increased to 5 seconds to reduce connection attempts
  private useFallbackMode = false; // Flag to indicate if we should use fallback mode
  private currentEndpointIndex = 0; // Track which endpoint we're currently using
  
  constructor() {
    this.cacheManager = new CacheManager();
    this.retryService = new RetryService({
      maxRetries: 1, // Reduced number of retries
      baseDelay: 800,
      maxDelay: 3000, // Reduced max delay
      exponentialFactor: 1.5,
      retryCondition: (error: any) => {
        // Don't retry on authentication errors or if we're in fallback mode
        console.log("Evaluating retry condition for error:", error);
        if (this.useFallbackMode) {
          console.log("In fallback mode, skipping retry");
          return false;
        }
        if (error && (error.status === 401 || error.status === 403)) {
          console.log("Auth error, skipping retry");
          return false;
        }
        console.log("Allowing retry attempt");
        return true;
      }
    });
  }

  /**
   * Get current endpoint based on retry attempts
   */
  private getCurrentEndpoint(): string {
    return KBAI_MCP_ENDPOINTS[this.currentEndpointIndex];
  }

  /**
   * Switch to next available endpoint
   */
  private switchToNextEndpoint(): string {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % KBAI_MCP_ENDPOINTS.length;
    console.log(`Switching to endpoint: ${this.getCurrentEndpoint()}`);
    return this.getCurrentEndpoint();
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
      if (this.useFallbackMode && !forceCheck) {
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
      
      // Try current endpoint
      let isHealthy = await checkApiHealth(this.getCurrentEndpoint(), this.getAuthHeaders());
      
      // If not healthy, try other endpoints
      if (!isHealthy) {
        const originalEndpoint = this.currentEndpointIndex;
        
        // Try each available endpoint
        for (let i = 0; i < KBAI_MCP_ENDPOINTS.length - 1; i++) {
          const nextEndpoint = this.switchToNextEndpoint();
          console.log(`Trying alternative endpoint: ${nextEndpoint}`);
          
          isHealthy = await checkApiHealth(nextEndpoint, this.getAuthHeaders());
          if (isHealthy) {
            console.log(`Found working endpoint: ${nextEndpoint}`);
            break;
          }
        }
        
        // If we tried all endpoints and none worked, go back to the original
        if (!isHealthy) {
          this.currentEndpointIndex = originalEndpoint;
          console.log(`No working endpoints found. Reverting to original: ${this.getCurrentEndpoint()}`);
        }
      }
      
      this.connectionStatus = isHealthy ? 'connected' : 'error';
      console.log(`KBAI health check result: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      
      // If not healthy, immediately switch to fallback mode instead of retrying
      if (!isHealthy) {
        this.useFallbackMode = true;
        console.log(`Entering fallback mode due to failed connection attempt`);
      } else {
        // Reset attempts on successful connection
        this.connectionAttempts = 0;
      }
      
      return isHealthy;
    } catch (error) {
      console.error('KBAI health check error:', error);
      this.connectionStatus = 'error';
      this.useFallbackMode = true;
      
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
          console.log('Using cached KBAI knowledge items:', cachedData.length);
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
        console.log('Force refresh: Resetting fallback mode and connection attempts');
      }
      
      this.connectionStatus = 'connecting';
      console.log('Fetching knowledge items from KBAI MCP server with options:', options);
      
      // Check API health first
      const isHealthy = await this.checkApiHealth(options.query === 'force-refresh');
      
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
        console.log(`Attempting SSE connection to KBAI server: ${this.getCurrentEndpoint()}...`);
        const items = await this.retryService.execute(() => 
          connectToSSE({
            endpoint: this.getCurrentEndpoint(),
            headers: this.getAuthHeaders(),
            ...options
          })
        );
        
        console.log(`SSE connection successful, received ${items?.length || 0} items`);
        
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
      
      // Try each endpoint until one works
      for (let i = 0; i < KBAI_MCP_ENDPOINTS.length; i++) {
        this.currentEndpointIndex = i;
        console.log(`Trying endpoint ${i + 1}: ${this.getCurrentEndpoint()}`);
        
        // Force health check on this endpoint
        const isHealthy = await this.checkApiHealth(true);
        
        if (isHealthy) {
          // Try to fetch some data to confirm connection works
          try {
            const items = await this.fetchKnowledgeItems({ query: 'force-refresh', limit: 3 });
            const success = items && items.length > 0 && !this.useFallbackMode;
            
            if (success) {
              console.log(`Successfully connected to endpoint: ${this.getCurrentEndpoint()}`);
              toast.success('Successfully connected to knowledge base', {
                description: 'Your connection has been refreshed'
              });
              return true;
            }
          } catch (fetchError) {
            console.error(`Error fetching data from endpoint ${this.getCurrentEndpoint()}:`, fetchError);
          }
        }
      }
      
      // If we get here, all endpoints failed
      console.log('All endpoints failed, using offline mode');
      toast.info('Using offline knowledge base', {
        description: 'Unable to connect to any KBAI server, using local data'
      });
      return false;
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
