
import { toast } from 'sonner';
import { KBAICache } from './KBAICache';
import { KBAIItemTransformer } from './services/KBAIItemTransformer';
import { KBAIRetryService } from './services/KBAIRetryService';
import { KBAIErrorHandler } from './services/KBAIErrorHandler';
import { getFallbackItems } from './fallbackItems';
import { 
  KBAIKnowledgeItem, 
  KBAIQueryOptions, 
  ConnectionStatus, 
  DiagnosticResult 
} from './types';

/**
 * Direct service for communicating with KBAI MCP server without using edge functions
 */
export class KBAIDirectService {
  // KBAI API endpoints
  private readonly KBAI_MCP_ENDPOINT = 'https://api.kbai.org/MCP/sse';
  private readonly KBAI_HEALTH_ENDPOINT = 'https://api.kbai.org/MCP/health';
  
  // Authentication tokens
  private readonly KBAI_AUTH_TOKEN = '85abed95769d4b2ea1cb6bfaa8a67193';
  private readonly KBAI_KB_TOKEN = 'KB00000001_CRPTMONDS';
  
  private connectionStatus: ConnectionStatus = 'disconnected';
  private currentRequestId: string | null = null;
  
  // Component services
  private cache: KBAICache;
  private errorHandler: KBAIErrorHandler;
  private transformer: KBAIItemTransformer;
  private retryService: KBAIRetryService;
  
  constructor() {
    // Initialize component services
    this.cache = new KBAICache();
    this.errorHandler = new KBAIErrorHandler();
    this.transformer = new KBAIItemTransformer();
    this.retryService = new KBAIRetryService();
    
    console.log('KBAIDirectService initialized with direct API connection');
  }

  /**
   * Check if the KBAI API is reachable
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      console.log('Testing connection to KBAI API server...');
      
      const testResponse = await fetch(this.KBAI_HEALTH_ENDPOINT || this.KBAI_MCP_ENDPOINT, {
        method: 'HEAD',
        headers: this.getAuthHeaders()
      });
      
      console.log(`KBAI API connection test status: ${testResponse.status}`);
      return testResponse.ok;
    } catch (error) {
      console.error('KBAI API connection test failed:', error);
      return false;
    }
  }
  
  /**
   * Run diagnostics on the KBAI connection
   */
  async runDiagnostics(): Promise<DiagnosticResult> {
    try {
      const startTime = Date.now();
      const isHealthy = await this.checkApiHealth();
      const responseTime = Date.now() - startTime;
      
      return {
        timestamp: new Date().toISOString(),
        edgeFunctionHealthy: true, // Always true since we're not using edge functions
        connectionStatus: this.connectionStatus,
        errorMessage: this.errorHandler.getLastErrorMessage(),
        details: {
          apiEndpoint: this.KBAI_MCP_ENDPOINT,
          directConnection: true,
          apiHealthy: isHealthy,
          responseTimeMs: responseTime
        }
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        edgeFunctionHealthy: true, // Not applicable
        connectionStatus: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
        error: 'Failed to run diagnostics',
        details: {
          apiEndpoint: this.KBAI_MCP_ENDPOINT,
          directConnection: true
        }
      };
    }
  }

  /**
   * Get authentication headers for KBAI API requests
   */
  private getAuthHeaders(requestId?: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-auth-token': this.KBAI_AUTH_TOKEN,
      'x-kb-token': this.KBAI_KB_TOKEN,
      ...(requestId ? { 'x-request-id': requestId } : {})
    };
  }

  /**
   * Fetch knowledge items from KBAI MCP server with retry logic
   */
  async fetchKnowledgeItems(options: KBAIQueryOptions = {}): Promise<KBAIKnowledgeItem[]> {
    try {
      const cacheKey = this.cache.getCacheKey(options);
      const cachedData = this.cache.getFromCache(cacheKey);
      
      if (cachedData) {
        console.log('Using cached KBAI knowledge items:', cachedData.length);
        return cachedData;
      }
      
      this.connectionStatus = 'connecting';
      console.log('Fetching knowledge items directly from KBAI MCP server with options:', options);
      
      // First check if the KBAI API is reachable
      const isHealthy = await this.checkApiHealth().catch((error) => {
        console.error('Health check error:', error);
        return false;
      });
      
      if (!isHealthy) {
        console.warn('KBAI API health check failed - server may be unreachable');
        this.connectionStatus = 'error';
        
        // Handle connection error
        const errorMessage = "KBAI API server is not reachable. Using fallback data.";
        this.errorHandler.handleConnectionError(new Error(errorMessage), false);
        
        // Cache the fallback items to avoid repeated errors
        const fallbackItems = getFallbackItems();
        this.cache.addToCache(cacheKey, fallbackItems);
        
        return fallbackItems;
      } else {
        console.log('KBAI API health check passed, proceeding with request');
      }
      
      // Generate a unique request ID for tracking
      this.currentRequestId = crypto.randomUUID();
      console.log(`Starting KBAI request with ID: ${this.currentRequestId}`);
      
      // Use retry service to handle retry logic
      const items = await this.retryService.executeWithRetry(async () => {
        // Make direct API call to KBAI server
        const response = await fetch(this.KBAI_MCP_ENDPOINT, {
          method: 'POST',
          headers: this.getAuthHeaders(this.currentRequestId!),
          body: JSON.stringify(options)
        });
        
        if (!response.ok) {
          console.error(`KBAI server returned status ${response.status}`);
          throw new Error(`KBAI server returned status ${response.status}`);
        }
        
        // Process SSE response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Failed to get response reader');
        
        const decoder = new TextDecoder();
        let result = '';
        let done = false;
        
        // Read the entire stream
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          
          if (value) {
            result += decoder.decode(value, { stream: !done });
          }
          
          if (done) break;
        }
        
        console.log(`Successfully read SSE response from KBAI server for request ${this.currentRequestId}`);
        
        // Process and return the knowledge data
        try {
          const knowledgeData = JSON.parse(result);
          return Array.isArray(knowledgeData.items) 
            ? knowledgeData.items.map((item) => this.transformer.transformKnowledgeItem(item))
            : [];
        } catch (parseError) {
          console.error('Error parsing KBAI response:', parseError, 'Raw response:', result);
          throw new Error(`Failed to parse KBAI response: ${parseError.message}`);
        }
      });
      
      this.connectionStatus = 'connected';
      this.errorHandler.reset();
      
      // Cache the results
      this.cache.addToCache(cacheKey, items);
      console.log('Successfully fetched and cached KBAI knowledge items:', items.length);
      
      // Show success toast
      toast("Connected to knowledge base");
      
      return items;
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Failed to fetch KBAI knowledge items:', error);
      
      // Handle connection error
      this.errorHandler.handleConnectionError(error, false);
      
      // Cache the fallback items to avoid repeated errors
      const fallbackItems = getFallbackItems();
      const errorCacheKey = this.cache.getCacheKey(options);
      this.cache.addToCache(errorCacheKey, fallbackItems);
      
      return fallbackItems;
    }
  }
  
  /**
   * Get connection status and detailed error information
   */
  getConnectionInfo(): { status: ConnectionStatus; errorMessage: string | null } {
    return {
      status: this.connectionStatus,
      errorMessage: this.errorHandler.getLastErrorMessage()
    };
  }
  
  /**
   * Reset connection status and cache
   */
  reset(): void {
    this.connectionStatus = 'disconnected';
    this.cache.clear();
    this.errorHandler.reset();
  }
}

// For testing and debugging direct connection
export const createKBAIDirectService = (): KBAIDirectService => {
  return new KBAIDirectService();
};
