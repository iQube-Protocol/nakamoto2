
import { toast } from 'sonner';
import { KBAICache } from './KBAICache';
import { KBAIConnector } from './KBAIConnector';
import { KBAIHealthCheck } from './KBAIHealthCheck';
import { getFallbackItems } from './fallbackItems';
import { 
  KBAIKnowledgeItem, 
  KBAIQueryOptions, 
  ConnectionStatus, 
  DiagnosticResult 
} from './types';

/**
 * Service for communicating with KBAI MCP server via Supabase edge functions
 */
export class KBAIMCPService {
  private connectionStatus: ConnectionStatus = 'disconnected';
  private maxRetries = 2; // Reduced from 3 to reduce wait time
  private retryDelay = 1000; // Start with 1 second delay
  private lastErrorMessage: string | null = null;
  private currentRequestId: string | null = null;
  private hasShownDeploymentError = false; // Track if we've shown the deployment error
  
  // Component services
  private cache: KBAICache;
  private connector: KBAIConnector;
  private healthCheck: KBAIHealthCheck;
  
  constructor() {
    // Use a fixed project ref since we can't access supabaseUrl directly
    const projectRef = 'odzaacarlkmxqrpmggwe'; // Using the value from config.toml
    const edgeFunctionUrl = `https://${projectRef}.supabase.co/functions/v1/kbai-connector`;
    
    // Initialize component services
    this.cache = new KBAICache();
    this.connector = new KBAIConnector(projectRef);
    this.healthCheck = new KBAIHealthCheck(edgeFunctionUrl);
    
    console.log(`KBAIMCPService initialized with edge function URL: ${edgeFunctionUrl}`);
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
    return this.healthCheck.runDiagnostics(this.connectionStatus, this.lastErrorMessage);
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
        this.lastErrorMessage = "Edge function not reachable. Verify deployment of the 'kbai-connector' function to Supabase.";
        this.connectionStatus = 'error';
        
        // Only show the toast error once per session, not on every attempt
        if (!this.hasShownDeploymentError) {
          toast.error("Knowledge Base Connection Failed", {
            description: "Edge function not deployed. Using fallback data.",
            duration: 5000
          });
          this.hasShownDeploymentError = true;
        }
        
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
      
      // Implement retry logic with exponential backoff
      let currentRetry = 0;
      let lastError: any = null;
      
      while (currentRetry <= this.maxRetries) {
        try {
          if (currentRetry > 0) {
            console.log(`KBAI retry attempt ${currentRetry} of ${this.maxRetries}`);
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, currentRetry - 1)));
          }
          
          // Fetch from KBAI connector
          const response = await this.connector.callKBAIConnector(options, this.currentRequestId);
          
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
          
          const items = response.data.items.map(this.transformKnowledgeItem);
          this.connectionStatus = 'connected';
          this.lastErrorMessage = null;
          this.hasShownDeploymentError = false;
          
          // Cache the results
          this.cache.addToCache(cacheKey, items);
          console.log('Successfully fetched and cached KBAI knowledge items:', items.length);
          
          // Show success toast
          toast("Connected to knowledge base");
          
          return items;
        } catch (error) {
          lastError = error;
          currentRetry++;
          console.warn(`KBAI fetch attempt ${currentRetry} failed:`, error);
          
          if (currentRetry > this.maxRetries) {
            // All retries failed
            throw error;
          }
        }
      }
      
      throw lastError; // Should never get here due to the throw in the loop
    } catch (error) {
      this.connectionStatus = 'error';
      this.lastErrorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to fetch KBAI knowledge after all retries:', error);
      
      // Show detailed error toast only if it's not a deployment error (which we've already shown)
      if (!this.hasShownDeploymentError) {
        toast.error("Knowledge base connection failed", {
          description: `Using fallback data.`
        });
      }
      
      // Cache the fallback items to avoid repeated errors
      const fallbackItems = getFallbackItems();
      this.cache.addToCache(cacheKey, fallbackItems);
      
      return fallbackItems;
    }
  }
  
  /**
   * Get connection status and detailed error information
   */
  getConnectionInfo(): { status: ConnectionStatus; errorMessage: string | null } {
    return {
      status: this.connectionStatus,
      errorMessage: this.lastErrorMessage
    };
  }
  
  /**
   * Reset connection status and cache
   */
  reset(): void {
    this.connectionStatus = 'disconnected';
    this.cache.clear();
    this.lastErrorMessage = null;
    this.hasShownDeploymentError = false;
  }
  
  /**
   * Transform raw knowledge item from KBAI format
   */
  private transformKnowledgeItem(item: any): KBAIKnowledgeItem {
    return {
      id: item.id || `kb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: item.title || 'Untitled Knowledge Item',
      content: item.content || item.text || '',
      type: item.type || 'general',
      source: item.source || 'KBAI',
      relevance: item.relevance || item.score || 0.5,
      timestamp: item.timestamp || new Date().toISOString()
    };
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

// Re-export types for convenience
export * from './types';
