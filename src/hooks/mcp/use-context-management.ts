
import { useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { toast } from 'sonner';

/**
 * Hook for managing conversation context
 */
export function useContextManagement(client: MCPClient | null) {
  // Initialize or get context for a conversation
  const initializeContext = useCallback(async (conversationId?: string) => {
    if (!client) return null;
    
    try {
      return await client.initializeContext(conversationId);
    } catch (error) {
      console.error('Error initializing MCP context:', error);
      
      // Handle storage quota errors
      if (
        error.name === 'QuotaExceededError' ||
        error.message?.includes('quota') ||
        error.message?.includes('storage')
      ) {
        toast.error('Browser storage full', {
          description: 'Trying to free up space by clearing old data...'
        });
        
        try {
          // Try to clear old contexts
          if (client.clearOldContexts()) {
            // Try again
            return await client.initializeContext(conversationId);
          }
        } catch (retryError) {
          console.error('Failed retry after clearing contexts:', retryError);
        }
      }
      
      toast.error('Failed to initialize conversation context');
      return null;
    }
  }, [client]);
  
  // Refresh the context
  const refreshContext = useCallback((): boolean => {
    try {
      if (!client) return false;
      
      const currentContextId = client.getCurrentContextId();
      if (currentContextId) {
        return Boolean(client.refreshContext());
      }
      return false;
    } catch (error) {
      console.error('Error refreshing context:', error);
      return false;
    }
  }, [client]);
  
  // Get current context ID
  const getCurrentContextId = useCallback((): string | null => {
    try {
      if (client) {
        return client.getCurrentContextId();
      }
      return null;
    } catch (error) {
      console.error('Error getting context ID:', error);
      return null;
    }
  }, [client]);

  return {
    initializeContext,
    refreshContext,
    getCurrentContextId
  };
}
