
import { useState, useCallback } from 'react';
import { KBAIQueryOptions } from '@/integrations/kbai';
import { useKnowledgeItems } from './useKnowledgeItems';

/**
 * Hook for searching knowledge items
 */
export function useKnowledgeSearch(initialOptions: KBAIQueryOptions = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    items,
    isLoading,
    error,
    fetchKnowledgeItems,
    updateQueryOptions
  } = useKnowledgeItems(initialOptions);
  
  // Search knowledge base
  const searchKnowledge = useCallback((query: string) => {
    setSearchQuery(query);
    updateQueryOptions({ query });
    return fetchKnowledgeItems({ query });
  }, [updateQueryOptions, fetchKnowledgeItems]);
  
  // Reset search
  const resetSearch = useCallback(() => {
    setSearchQuery('');
    const resetOptions = { query: '' };
    updateQueryOptions(resetOptions);
    return fetchKnowledgeItems(resetOptions);
  }, [updateQueryOptions, fetchKnowledgeItems]);
  
  return {
    searchQuery,
    items,
    isLoading,
    error,
    searchKnowledge,
    resetSearch,
    fetchKnowledgeItems
  };
}
