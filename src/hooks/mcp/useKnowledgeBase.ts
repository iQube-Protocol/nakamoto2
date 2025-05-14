
import { useState, useEffect, useCallback } from 'react';
import { KBAIMCPService } from '@/integrations/kbai';

export function useKnowledgeBase(options = {}) {
  const [items, setItems] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch knowledge items
  const fetchKnowledgeItems = useCallback(async (refresh = false) => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      console.log('Fetching knowledge items...');
      const kbaiService = new KBAIMCPService();
      
      // Clear cache if refreshing
      if (refresh) {
        kbaiService.reset();
      }
      
      const result = await kbaiService.fetchKnowledgeItems(options);
      
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

  // Search knowledge items
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
    searchKnowledge,
    resetSearch
  };
}
