import { RetryService } from '@/services/RetryService';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { KBAIKnowledgeItem, KBAIQueryOptions, ConnectionStatus } from './index';
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
  private cache: Map<string, { data: KBAIKnowledgeItem[], timestamp: number }> = new Map();
  private cacheLifetime = 5 * 60 * 1000; // 5 minutes
  private readonly retryService: RetryService;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  
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
      'x-kb-token': KBAI_KB_TOKEN,
      'Origin': window.location.origin,
      'Accept': 'text/event-stream'
    };
  }

  /**
   * Check if the KBAI API is healthy and accessible
   * Using GET instead of OPTIONS for more reliable health check
   */
  public async checkApiHealth(): Promise<boolean> {
    try {
      this.connectionStatus = 'connecting';
      console.log('Checking KBAI API health...');
      
      // Use a simpler GET request for health check with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${KBAI_MCP_ENDPOINT}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal
      }).catch(error => {
        console.error('KBAI health check fetch error:', error);
        // Check if this is a CORS error
        if (error.message && error.message.includes('CORS')) {
          console.error('CORS error detected when connecting to KBAI API');
          toast.error('KBAI API CORS error', { 
            description: 'Please check CORS configuration on the server' 
          });
        }
        return null;
      });
      
      clearTimeout(timeoutId);
      
      // If response is null, connection failed
      if (!response) {
        this.connectionStatus = 'error';
        return false;
      }
      
      const isHealthy = response.ok;
      this.connectionStatus = isHealthy ? 'connected' : 'error';
      
      console.log(`KBAI API health check: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
      return isHealthy;
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('KBAI health check failed:', error);
      
      // Add more detailed error logging
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        console.error('Network error when connecting to KBAI API. Possibly CORS related or server is unavailable.');
      }
      
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
        return this.getFallbackItems();
      }
      
      // Try connecting with retry logic for the SSE connection
      try {
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
      } catch (sseError) {
        console.error('SSE connection error:', sseError);
        this.connectionStatus = 'error';
        return this.getFallbackItems();
      }
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Failed to fetch KBAI knowledge:', error);
      return this.getFallbackItems();
    }
  }

  /**
   * Connect to the KBAI server using Server-Sent Events
   * Added better error handling and timeout management
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
        headers: this.getAuthHeaders(),
        withCredentials: false, // Setting this explicitly to false for CORS
        heartbeatTimeout: 10000 // 10 seconds heartbeat timeout
      });
      
      const knowledgeItems: KBAIKnowledgeItem[] = [];
      const timeout = setTimeout(() => {
        if (eventSource.readyState !== eventSource.CLOSED) {
          console.log('SSE connection timed out after 15s, closing connection');
          eventSource.close();
          resolve(knowledgeItems.length > 0 ? knowledgeItems : this.getFallbackItems());
        }
      }, 15000); // 15 second timeout
      
      eventSource.onopen = (event) => {
        console.log('SSE connection opened successfully', event);
      };
      
      eventSource.onmessage = (event) => {
        try {
          console.log('Received SSE event data:', event.data);
          
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (parseError) {
            console.warn('Failed to parse SSE event as JSON, trying alternative formats', parseError);
            
            // Try alternative format - some SSE servers send data differently
            // Check if it's a string that needs further processing
            if (typeof event.data === 'string' && event.data.includes('{')) {
              const jsonStr = event.data.substring(event.data.indexOf('{'));
              try {
                data = JSON.parse(jsonStr);
              } catch (e) {
                console.error('Alternative parsing failed too:', e);
                // Continue with event loop, don't add this item
                return;
              }
            } else {
              // If we can't parse it at all, just continue
              return;
            }
          }
          
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
          console.error('Error processing SSE message:', error);
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
      timestamp: item.timestamp || new Date().toISOString()  // Ensure timestamp is always set
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
    this.connectionAttempts = 0;
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
