
import { useState, useEffect, useCallback } from 'react';
import { KBAIMCPService } from '@/integrations/kbai';
import { RetryService } from '@/services/RetryService';

export function useKnowledgeBase(options = {}) {
  const [items, setItems] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxRetries = 3;

  // Create a retry service with 3 retry attempts
  const retryService = new RetryService({
    maxRetries: maxRetries - 1, // We already do one attempt initially
    baseDelay: 1000,
    maxDelay: 3000,
    exponentialFactor: 1.5,
    jitter: true,
    retryNotification: false,
  });

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
        setConnectionAttempts(0);
      }
      
      // Use the retry service to attempt the connection multiple times
      const result = await retryService.execute(async () => {
        setConnectionAttempts(prev => {
          const newCount = prev + 1;
          console.log(`Connection attempt ${newCount} of ${maxRetries}`);
          return newCount;
        });
        
        const items = await kbaiService.fetchKnowledgeItems(options);
        if (!items || items.length === 0) {
          throw new Error('No knowledge items returned');
        }
        return items;
      });
      
      setItems(result);
      setConnectionStatus(kbaiService.getConnectionStatus());
      
      console.log(`Fetched ${result.length} knowledge items with status: ${kbaiService.getConnectionStatus()}`);
      return true;
    } catch (error) {
      console.error('Error fetching knowledge items after retries:', error);
      setConnectionStatus('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Retry connection to KBAI
  const retryConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    setConnectionAttempts(0);
    
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
    connectionAttempts,
    maxRetries,
    fetchKnowledgeItems,
    retryConnection,
    searchKnowledge,
    resetSearch
  };
}
