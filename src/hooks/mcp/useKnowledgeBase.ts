
import { useState, useEffect, useCallback } from 'react';
import { KBAIService } from '@/integrations/kbai';

export function useKnowledgeBase() {
  const [items, setItems] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch knowledge items
  const fetchKnowledgeItems = useCallback(async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      console.log('Fetching knowledge items...');
      const kbaiService = new KBAIService();
      const result = await kbaiService.fetchKnowledgeItems();
      
      setItems(result.items);
      setConnectionStatus(result.status);
      
      console.log(`Fetched ${result.items.length} knowledge items with status: ${result.status}`);
      return true;
    } catch (error) {
      console.error('Error fetching knowledge items:', error);
      setConnectionStatus('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on initial mount
  useEffect(() => {
    fetchKnowledgeItems();
  }, [fetchKnowledgeItems]);

  return {
    items,
    connectionStatus,
    isLoading,
    fetchKnowledgeItems
  };
}
