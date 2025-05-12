
import { useEffect } from 'react';
import { KBAIQueryOptions } from '@/integrations/kbai';
import { useKnowledgeItems } from './useKnowledgeItems';
import { useKnowledgeConnection } from './useKnowledgeConnection';
import { useKnowledgeSearch } from './useKnowledgeSearch';

/**
 * Combined hook for all knowledge base functionality
 */
export function useKnowledgeBase(options: KBAIQueryOptions = {}) {
  // Use all the individual hooks
  const {
    items,
    isLoading: isItemsLoading,
    error,
    queryOptions,
    updateQueryOptions,
    fetchKnowledgeItems
  } = useKnowledgeItems(options);
  
  const {
    connectionStatus,
    errorMessage,
    reconnectAttempts,
    isLoading: isConnectionLoading,
    reconnect,
    runDiagnostics
  } = useKnowledgeConnection();
  
  const {
    searchQuery,
    searchKnowledge,
    resetSearch
  } = useKnowledgeSearch(options);
  
  // Combined loading state
  const isLoading = isItemsLoading || isConnectionLoading;
  
  // Attempt initial connection
  useEffect(() => {
    const attemptInitialConnection = async () => {
      try {
        await fetchKnowledgeItems();
      } catch (error) {
        console.error('Failed to establish initial KBAI connection:', error);
      }
    };
    
    attemptInitialConnection();
  }, [fetchKnowledgeItems]);
  
  return {
    // Data
    items,
    isLoading,
    error,
    connectionStatus,
    errorMessage,
    reconnectAttempts,
    searchQuery,
    queryOptions,
    
    // Methods
    fetchKnowledgeItems,
    updateQueryOptions,
    searchKnowledge,
    resetSearch,
    reconnect,
    runDiagnostics
  };
}

// Also export all the individual hooks for more granular usage
export { useKnowledgeItems } from './useKnowledgeItems';
export { useKnowledgeConnection } from './useKnowledgeConnection';
export { useKnowledgeSearch } from './useKnowledgeSearch';

// Re-export state interfaces for convenience
export type { KnowledgeItemsState } from './useKnowledgeItems';
export type { ConnectionState } from './useKnowledgeConnection';
