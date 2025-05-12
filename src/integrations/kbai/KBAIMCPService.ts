import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

interface KBAIConnectorResponse {
  data: {
    items: any[];
    metadata?: {
      source: string;
      timestamp: string;
      error?: string;
      requestId?: string;
    };
    error?: string;
    status?: number;
  } | null;
  error: Error | null;
}

/**
 * Service for communicating with KBAI MCP server via Supabase edge functions
 */
export class KBAIMCPService {
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private cache: Map<string, { data: KBAIKnowledgeItem[], timestamp: number }> = new Map();
  private cacheLifetime = 5 * 60 * 1000; // 5 minutes
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second delay
  private lastErrorMessage: string | null = null;

  /**
   * Fetch knowledge items from KBAI MCP server with retry logic
   */
  async fetchKnowledgeItems(options: KBAIQueryOptions = {}): Promise<KBAIKnowledgeItem[]> {
    try {
      const cacheKey = this.getCacheKey(options);
      const cachedData = this.getFromCache(cacheKey);
      
      if (cachedData) {
        console.log('Using cached KBAI knowledge items:', cachedData.length);
        return cachedData;
      }
      
      this.connectionStatus = 'connecting';
      console.log('Fetching knowledge items from KBAI MCP server with options:', options);
      
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
          
          // Fetch from Supabase edge function
          const response = await this.callKBAIConnector(options);
          
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
          
          // Cache the results
          this.addToCache(cacheKey, items);
          console.log('Successfully fetched and cached KBAI knowledge items:', items.length);
          
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
      
      toast.error('Failed to connect to knowledge base', {
        description: 'Using fallback knowledge items instead'
      });
      
      return this.getFallbackItems();
    }
  }
  
  /**
   * Get connection status and detailed error information
   */
  getConnectionInfo(): { status: 'disconnected' | 'connecting' | 'connected' | 'error'; errorMessage: string | null } {
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
  }
  
  /**
   * Call the KBAI connector edge function with timeout
   */
  private async callKBAIConnector(options: KBAIQueryOptions): Promise<KBAIConnectorResponse> {
    // Instead of using AbortController, we'll implement timeout with Promise.race
    const timeoutPromise = new Promise<KBAIConnectorResponse>((_, reject) => {
      setTimeout(() => reject(new Error('KBAI connection timed out after 10 seconds')), 10000);
    });
    
    try {
      // Call the Supabase edge function with the request ID for tracking
      const functionPromise = supabase.functions.invoke('kbai-connector', {
        body: { 
          options,
          requestId: crypto.randomUUID() // Add a request ID for tracking
        }
      }) as Promise<KBAIConnectorResponse>;
      
      // Use Promise.race to implement timeout without AbortController
      const response = await Promise.race([functionPromise, timeoutPromise]);
      return response;
    } catch (error) {
      // Check if this was a timeout error
      if (error.message === 'KBAI connection timed out after 10 seconds') {
        throw new Error('KBAI connection timed out after 10 seconds');
      }
      throw error;
    }
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
