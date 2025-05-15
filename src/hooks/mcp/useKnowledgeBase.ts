
import { useState, useEffect, useCallback } from 'react';
import { KBAIMCPService } from '@/integrations/kbai';

// Define parameter type to accept either boolean or object
type FetchParams = boolean | Record<string, any>;

export function useKnowledgeBase(options = {}) {
  const [items, setItems] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch knowledge items - modified to handle different parameter types
  const fetchKnowledgeItems = useCallback(async (params: FetchParams = false) => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      console.log('Fetching knowledge items...');
      const kbaiService = new KBAIMCPService();
      
      // Handle different parameter types
      const refresh = typeof params === 'boolean' ? params : false;
      const additionalOptions = typeof params === 'object' ? params : {};
      
      // Clear cache if refreshing
      if (refresh) {
        kbaiService.reset();
      }
      
      // Merge options with any additional options passed
      const mergedOptions = {
        ...options,
        ...additionalOptions
      };
      
      const result = await kbaiService.fetchKnowledgeItems(mergedOptions);
      
      setItems(result);
      setConnectionStatus(kbaiService.getConnectionStatus());
      
      console.log(`Fetched ${result.length} knowledge items with status: ${kbaiService.getConnectionStatus()}`);
      return true;
    } catch (error) {
      console.error('Error fetching knowledge items:', error);
      setConnectionStatus('error');
      return false;
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
      return fetchKnowledgeItems(true);
    } catch (error) {
      console.error('Error retrying connection:', error);
      setConnectionStatus('error');
      return false;
    }
  }, [fetchKnowledgeItems]);

  // Search knowledge items - updated to use the updated fetchKnowledgeItems
  const searchKnowledge = useCallback(async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    
    try {
      console.log(`Searching knowledge items for: ${query}`);
      const kbaiService = new KBAIMCPService();
      const result = await kbaiService.fetchKnowledgeItems({
        ...options,
        query
      });
      
      setItems(result);
      return true;
    } catch (error) {
      console.error('Error searching knowledge items:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

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
