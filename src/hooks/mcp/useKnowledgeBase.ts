
import { useState, useEffect, useCallback } from 'react';
import { getKBAIService, KBAIKnowledgeItem, KBAIQueryOptions } from '@/integrations/kbai/KBAIMCPService';

export interface KnowledgeBaseState {
  items: KBAIKnowledgeItem[];
  isLoading: boolean;
  error: Error | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export function useKnowledgeBase(options: KBAIQueryOptions = {}) {
  const [state, setState] = useState<KnowledgeBaseState>({
    items: [],
    isLoading: false,
    error: null,
    connectionStatus: 'disconnected'
  });
  const [queryOptions, setQueryOptions] = useState<KBAIQueryOptions>(options);
  
  // Get KBAI service
  const kbaiService = getKBAIService();
  
  // Fetch knowledge items
  const fetchKnowledgeItems = useCallback(async () => {
    if (state.isLoading) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const items = await kbaiService.fetchKnowledgeItems(queryOptions);
      const status = kbaiService.getConnectionStatus();
      
      setState({
        items,
        isLoading: false,
        error: null,
        connectionStatus: status
      });
      
      console.log(`Fetched ${items.length} knowledge items with status: ${status}`);
    } catch (error) {
      console.error('Error in useKnowledgeBase:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        connectionStatus: 'error'
      }));
    }
  }, [kbaiService, queryOptions, state.isLoading]);
  
  // Update query options
  const updateQueryOptions = useCallback((newOptions: KBAIQueryOptions) => {
    setQueryOptions(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  // Search knowledge base
  const searchKnowledge = useCallback((query: string) => {
    updateQueryOptions({ query });
  }, [updateQueryOptions]);
  
  // Reset search
  const resetSearch = useCallback(() => {
    updateQueryOptions({ query: '' });
  }, [updateQueryOptions]);
  
  // Fetch knowledge items when component mounts or options change
  useEffect(() => {
    fetchKnowledgeItems();
  }, [fetchKnowledgeItems]);
  
  return {
    ...state,
    fetchKnowledgeItems,
    updateQueryOptions,
    searchKnowledge,
    resetSearch
  };
}
