
import { toast } from 'sonner';

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
 * Service for communicating with KBAI MCP server via Supabase edge functions
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
      
      // Fetch from Supabase edge function
      const { data, error } = await this.callKBAIConnector(options);
      
      if (error) {
        console.error('Error fetching KBAI knowledge:', error);
        this.connectionStatus = 'error';
        throw new Error(`KBAI knowledge fetch error: ${error.message || 'Unknown error'}`);
      }
      
      if (!data || !Array.isArray(data.items)) {
        console.warn('Invalid response from KBAI connector:', data);
        this.connectionStatus = 'error';
        return this.getFallbackItems();
      }
      
      const items = data.items.map(this.transformKnowledgeItem);
      this.connectionStatus = 'connected';
      
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
  }
  
  /**
   * Call the KBAI connector edge function
   */
  private async callKBAIConnector(options: KBAIQueryOptions) {
    // In a real implementation, this would call the Supabase edge function
    // For now, we'll simulate the call with a mock response
    
    // TODO: Replace with actual Supabase edge function call
    // return await supabase.functions.invoke('kbai-connector', {
    //   body: { options }
    // });
    
    // Mock implementation for testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            items: this.getMockKnowledgeItems(options)
          },
          error: null
        });
      }, 500);
    });
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
   * Get mock knowledge items for testing
   */
  private getMockKnowledgeItems(options: KBAIQueryOptions): any[] {
    let items = [
      {
        id: 'kb-001',
        title: 'Blockchain Fundamentals',
        content: 'A blockchain is a distributed database that maintains a continuously growing list of records, called blocks, which are linked using cryptography.',
        type: 'concept',
        source: 'KBAI',
        relevance: 0.95,
        timestamp: new Date().toISOString()
      },
      {
        id: 'kb-002',
        title: 'Token Economics',
        content: 'Token economics involves the study of economic systems governed by the properties of tokens, including their supply, distribution, and incentives.',
        type: 'concept',
        source: 'KBAI',
        relevance: 0.85,
        timestamp: new Date().toISOString()
      },
      {
        id: 'kb-003',
        title: 'DeFi: Decentralized Finance',
        content: 'DeFi refers to financial applications built on blockchain technologies, generally using smart contracts. These applications are open to anyone with an internet connection.',
        type: 'guide',
        source: 'KBAI',
        relevance: 0.9,
        timestamp: new Date().toISOString()
      },
      {
        id: 'kb-004',
        title: 'NFTs Explained',
        content: 'Non-fungible tokens (NFTs) are cryptographic assets on a blockchain with unique identification codes that distinguish them from each other.',
        type: 'guide',
        source: 'KBAI',
        relevance: 0.8,
        timestamp: new Date().toISOString()
      }
    ];
    
    // Filter by query if provided
    if (options.query) {
      const query = options.query.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.content.toLowerCase().includes(query)
      );
    }
    
    // Apply limit if provided
    if (options.limit && options.limit > 0) {
      items = items.slice(0, options.limit);
    }
    
    return items;
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
