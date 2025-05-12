
import { useState, useEffect, useCallback } from 'react';
import { getKBAIService, KBAIKnowledgeItem, KBAIQueryOptions } from '@/integrations/kbai/KBAIMCPService';

export interface KnowledgeBaseState {
  items: KBAIKnowledgeItem[];
  isLoading: boolean;
  error: Error | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
}

export function useKnowledgeBase(options: KBAIQueryOptions = {}) {
  const [state, setState] = useState<KnowledgeBaseState>({
    items: [],
    isLoading: false,
    error: null,
    connectionStatus: 'disconnected',
    errorMessage: null
  });
  const [queryOptions, setQueryOptions] = useState<KBAIQueryOptions>(options);
  
  // Get KBAI service
  const kbaiService = getKBAIService();
  
  // Fetch knowledge items
  const fetchKnowledgeItems = useCallback(async (newOptions?: KBAIQueryOptions) => {
    // If new options are provided, update the query options
    if (newOptions) {
      setQueryOptions(prevOptions => ({ ...prevOptions, ...newOptions }));
    }
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Use current options merged with any new options
      const currentOptions = newOptions ? { ...queryOptions, ...newOptions } : queryOptions;
      const items = await kbaiService.fetchKnowledgeItems(currentOptions);
      const { status, errorMessage } = kbaiService.getConnectionInfo();
      
      setState({
        items,
        isLoading: false,
        error: null,
        connectionStatus: status,
        errorMessage
      });
      
      console.log(`Fetched ${items.length} knowledge items with status: ${status}`);
    } catch (error) {
      console.error('Error in useKnowledgeBase:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        connectionStatus: 'error',
        errorMessage: error instanceof Error ? error.message : String(error)
      }));
    }
  }, [kbaiService, queryOptions]);
  
  // Update query options
  const updateQueryOptions = useCallback((newOptions: KBAIQueryOptions) => {
    setQueryOptions(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  // Search knowledge base
  const searchKnowledge = useCallback((query: string) => {
    updateQueryOptions({ query });
    fetchKnowledgeItems({ query });
  }, [updateQueryOptions, fetchKnowledgeItems]);
  
  // Reset search
  const resetSearch = useCallback(() => {
    const resetOptions = { query: '' };
    updateQueryOptions(resetOptions);
    fetchKnowledgeItems(resetOptions);
  }, [updateQueryOptions, fetchKnowledgeItems]);
  
  // Fetch knowledge items when component mounts or options change
  useEffect(() => {
    fetchKnowledgeItems();
  }, []); // Intentionally only run on mount
  
  return {
    ...state,
    fetchKnowledgeItems,
    updateQueryOptions,
    searchKnowledge,
    resetSearch
  };
}
