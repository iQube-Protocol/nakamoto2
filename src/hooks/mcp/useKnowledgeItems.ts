
import { useState, useCallback } from 'react';
import { getKBAIService, KBAIKnowledgeItem, KBAIQueryOptions } from '@/integrations/kbai';
import { toast } from 'sonner';

export interface KnowledgeItemsState {
  items: KBAIKnowledgeItem[];
  isLoading: boolean;
  error: Error | null;
  lastAttemptTimestamp: number | null;
}

/**
 * Hook for fetching knowledge items from KBAI
 */
export function useKnowledgeItems(initialOptions: KBAIQueryOptions = {}) {
  const [state, setState] = useState<KnowledgeItemsState>({
    items: [],
    isLoading: false,
    error: null,
    lastAttemptTimestamp: null
  });
  const [queryOptions, setQueryOptions] = useState<KBAIQueryOptions>(initialOptions);
  
  // Get KBAI service
  const kbaiService = getKBAIService();
  
  // Fetch knowledge items
  const fetchKnowledgeItems = useCallback(async (newOptions?: KBAIQueryOptions) => {
    // If new options are provided, update the query options
    if (newOptions) {
      setQueryOptions(prevOptions => ({ ...prevOptions, ...newOptions }));
    }
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      lastAttemptTimestamp: Date.now() 
    }));
    
    try {
      // Use current options merged with any new options
      const currentOptions = newOptions ? { ...queryOptions, ...newOptions } : queryOptions;
      console.log(`Attempting to fetch knowledge items with options:`, currentOptions);
      
      const items = await kbaiService.fetchKnowledgeItems(currentOptions);
      
      setState({
        items,
        isLoading: false,
        error: null,
        lastAttemptTimestamp: Date.now()
      });
      
      console.log(`Fetched ${items.length} knowledge items`);
      return items;
    } catch (error) {
      console.error('Error in useKnowledgeItems:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        lastAttemptTimestamp: Date.now()
      }));
      
      toast(`Failed to fetch knowledge items: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return [];
    }
  }, [kbaiService, queryOptions]);
  
  // Update query options
  const updateQueryOptions = useCallback((newOptions: KBAIQueryOptions) => {
    setQueryOptions(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  return {
    ...state,
    queryOptions,
    fetchKnowledgeItems,
    updateQueryOptions
  };
}
