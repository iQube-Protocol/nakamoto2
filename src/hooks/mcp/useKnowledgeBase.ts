
import { useState, useEffect, useCallback } from 'react';
import { KBAIMCPService } from '@/integrations/kbai';

// Define parameter types for better type safety
interface KnowledgeBaseParams {
  query?: string;
  refresh?: boolean;
  [key: string]: any; // Allow additional parameters
}

export function useKnowledgeBase(options = {}) {
  const [items, setItems] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced fetchKnowledgeItems function that handles both boolean and object params
  const fetchKnowledgeItems = useCallback(async (paramsOrRefresh?: boolean | KnowledgeBaseParams) => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      console.log('Fetching knowledge items...');
      const kbaiService = new KBAIMCPService();
      
      // Process parameters based on type
      let refresh = false;
      let params = { ...options };
      
      if (typeof paramsOrRefresh === 'boolean') {
        // Handle boolean parameter (legacy usage)
        refresh = paramsOrRefresh;
        console.log(`Fetching with refresh=${refresh}`);
      } else if (paramsOrRefresh && typeof paramsOrRefresh === 'object') {
        // Handle object parameter (new usage)
        refresh = paramsOrRefresh.refresh || false;
        params = { ...options, ...paramsOrRefresh };
        delete params.refresh; // Remove refresh from params as it's handled separately
        console.log(`Fetching with params:`, params, `and refresh=${refresh}`);
      }
      
      // Clear cache if refreshing
      if (refresh) {
        console.log('Refreshing knowledge base cache');
        kbaiService.reset();
      }
      
      const result = await kbaiService.fetchKnowledgeItems(params);
      
      setItems(result);
      setConnectionStatus(kbaiService.getConnectionStatus());
      
      console.log(`Fetched ${result.length} knowledge items with status: ${kbaiService.getConnectionStatus()}`);
      return result;
    } catch (error) {
      console.error('Error fetching knowledge items:', error);
      setConnectionStatus('error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Retry connection to KBAI
  const retryConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    
    try {
      const kbaiService = new KBAIMCPService();
      await kbaiService.reset();
      
      // Re-fetch knowledge items after reset
      return fetchKnowledgeItems({ refresh: true });
    } catch (error) {
      console.error('Error retrying connection:', error);
      setConnectionStatus('error');
      return false;
    }
  }, [fetchKnowledgeItems]);

  // Search knowledge items
  const searchKnowledge = useCallback(async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    
    try {
      console.log(`Searching knowledge items for: ${query}`);
      const result = await fetchKnowledgeItems({
        query,
        ...options
      });
      
      return !!result && Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error('Error searching knowledge items:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options, fetchKnowledgeItems]);

  // Reset search
  const resetSearch = useCallback(async () => {
    setSearchQuery('');
    return fetchKnowledgeItems();
  }, [fetchKnowledgeItems]);

  // Fetch on initial mount
  useEffect(() => {
    fetchKnowledgeItems();
  }, [fetchKnowledgeItems]);

  return {
    items,
    connectionStatus,
    isLoading,
    searchQuery,
    fetchKnowledgeItems,
    retryConnection,
    searchKnowledge,
    resetSearch
  };
}
