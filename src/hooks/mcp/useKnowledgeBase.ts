
import { useEffect, useState } from 'react';
import { KBAIQueryOptions } from '@/integrations/kbai';
import { useKnowledgeItems } from './useKnowledgeItems';
import { useKnowledgeConnection } from './useKnowledgeConnection';
import { useKnowledgeSearch } from './useKnowledgeSearch';
import { toast } from 'sonner';

/**
 * Combined hook for all knowledge base functionality
 */
export function useKnowledgeBase(options: KBAIQueryOptions = {}) {
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  
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
    runDiagnostics,
    checkConnectionStatus
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
        console.log('Attempting initial knowledge base connection...');
        setConnectionAttempted(true);
        await fetchKnowledgeItems();
      } catch (error) {
        console.error('Failed to establish initial KBAI connection:', error);
        // Show detailed error toast
        toast.error("Knowledge Base Connection Failed", {
          description: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    };
    
    if (!connectionAttempted) {
      attemptInitialConnection();
    }
  }, [fetchKnowledgeItems, connectionAttempted]);
  
  // Updated reconnect function with better error handling
  const enhancedReconnect = async () => {
    toast("Attempting to reconnect to knowledge base...");
    try {
      const success = await reconnect();
      if (success) {
        // Refresh knowledge items
        await fetchKnowledgeItems();
      }
      return success;
    } catch (error) {
      console.error('Enhanced reconnect failed:', error);
      toast.error("Reconnection failed", {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return false;
    }
  };
  
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
    reconnect: enhancedReconnect,
    runDiagnostics,
    checkConnectionStatus
  };
}

// Also export all the individual hooks for more granular usage
export { useKnowledgeItems } from './useKnowledgeItems';
export { useKnowledgeConnection } from './useKnowledgeConnection';
export { useKnowledgeSearch } from './useKnowledgeSearch';

// Re-export state interfaces for convenience
export type { KnowledgeItemsState } from './useKnowledgeItems';
export type { ConnectionState } from './useKnowledgeConnection';
