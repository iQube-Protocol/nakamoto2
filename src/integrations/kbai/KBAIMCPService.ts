import { toast } from 'sonner';
import { KBAICache } from './KBAICache';
import { KBAIConnector } from './KBAIConnector';
import { KBAIHealthCheck } from './KBAIHealthCheck';
import { KBAIErrorHandler } from './services/KBAIErrorHandler';
import { KBAIItemTransformer } from './services/KBAIItemTransformer';
import { KBAIRetryService } from './services/KBAIRetryService';
import { getFallbackItems } from './fallbackItems';
import { 
  KBAIKnowledgeItem, 
  KBAIQueryOptions, 
  ConnectionStatus, 
  DiagnosticResult 
} from './types';

/**
 * LEGACY Service for communicating with KBAI MCP server via Supabase edge functions
 * This is kept for reference but not used by default anymore since we're using direct API calls
 */
export class KBAIMCPService {
  private connectionStatus: ConnectionStatus = 'disconnected';
  private currentRequestId: string | null = null;
  
  // Component services
  private cache: KBAICache;
  private connector: KBAIConnector;
  private healthCheck: KBAIHealthCheck;
  private errorHandler: KBAIErrorHandler;
  private transformer: KBAIItemTransformer;
  private retryService: KBAIRetryService;
  
  constructor() {
    // Use a fixed project ref since we can't access supabaseUrl directly
    const projectRef = 'odzaacarlkmxqrpmggwe'; // Using the value from config.toml
    const edgeFunctionUrl = `https://${projectRef}.supabase.co/functions/v1/kbai-connector`;
    
    console.warn('Creating legacy KBAIMCPService - this service is no longer used by default');
    
    // Initialize component services
    this.cache = new KBAICache();
    this.connector = new KBAIConnector(projectRef);
    this.healthCheck = new KBAIHealthCheck(edgeFunctionUrl);
    this.errorHandler = new KBAIErrorHandler();
    this.transformer = new KBAIItemTransformer();
    this.retryService = new KBAIRetryService();
    
    console.log(`[LEGACY] KBAIMCPService initialized with edge function URL: ${edgeFunctionUrl}`);
  }

  /**
   * Check if the edge function is reachable
   */
  async checkEdgeFunctionHealth(): Promise<boolean> {
    return this.healthCheck.checkEdgeFunctionHealth();
  }
  
  /**
   * Run diagnostics on the KBAI connection
   */
  async runDiagnostics(): Promise<DiagnosticResult> {
    return this.healthCheck.runDiagnostics(
      this.connectionStatus, 
      this.errorHandler.getLastErrorMessage()
    );
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
      console.log('Fetching knowledge items from KBAI MCP server with options:', options);
      
      // First check if the edge function is reachable
      const isHealthy = await this.checkEdgeFunctionHealth().catch((error) => {
        console.error('Health check error:', error);
        return false;
      });
      
      if (!isHealthy) {
        console.warn('KBAI edge function health check failed - edge function may not be deployed');
        this.connectionStatus = 'error';
        
        // Handle deployment error
        const errorMessage = "Edge function not reachable. Verify deployment of the 'kbai-connector' function to Supabase.";
        this.errorHandler.handleConnectionError(new Error(errorMessage), true);
        
        // Cache the fallback items to avoid repeated errors
        const fallbackItems = getFallbackItems();
        this.cache.addToCache(cacheKey, fallbackItems);
        
        return fallbackItems;
      } else {
        console.log('KBAI edge function health check passed, proceeding with request');
      }
      
      // Generate a unique request ID for tracking
      this.currentRequestId = crypto.randomUUID();
      console.log(`Starting KBAI request with ID: ${this.currentRequestId}`);
      
      // Use retry service to handle retry logic
      const items = await this.retryService.executeWithRetry(async () => {
        // Fetch from KBAI connector
        const response = await this.connector.callKBAIConnector(options, this.currentRequestId!);
        
        if (response.error) {
          throw new Error(`KBAI connector error: ${response.error.message || 'Unknown error'}`);
        }
        
        if (!response.data) {
          throw new Error('Empty response from KBAI connector');
        }
        
        // Check if the response itself contains an error
        if (response.data.error) {
          throw new Error(`KBAI server error: ${response.data.error}`);
        }
        
        if (!Array.isArray(response.data.items)) {
          console.warn('Invalid response from KBAI connector:', response.data);
          throw new Error('Invalid items format in KBAI response');
        }
        
        return response.data.items.map((item) => this.transformer.transformKnowledgeItem(item));
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
      console.error('Failed to fetch KBAI knowledge after all retries:', error);
      
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

// Legacy factory function - no longer used by default
export const createKBAIMCPService = (): KBAIMCPService => {
  console.warn('Creating legacy KBAIMCPService - direct API connection is now used by default');
  return new KBAIMCPService();
};
