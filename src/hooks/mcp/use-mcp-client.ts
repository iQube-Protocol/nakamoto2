import { useState, useEffect, useCallback } from 'react';
import { MCPClient, getMCPClient } from '@/integrations/mcp/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

/**
 * Hook for initializing and managing the MCP client
 */
export function useMCPClient() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Initialize MCP client
  useEffect(() => {
    if (user) {
      try {
        // Try to clean up localStorage first
        const localStorageSize = JSON.stringify(localStorage).length;
        if (localStorageSize > 4000000) { // If more than 4MB
          console.warn('localStorage is nearly full, attempting cleanup...');
          // Find and clear old MCP contexts
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mcp_context_') && key !== 'mcp_context_current') {
              try {
                localStorage.removeItem(key);
              } catch (e) {
                console.error(`Failed to remove ${key}:`, e);
              }
            }
          });
        }
        
        const mcpClient = getMCPClient({
          // Check for metisActive status from localStorage
          metisActive: localStorage.getItem('metisActive') === 'true'
        });
        
        // Add custom methods to handle storage issues
        if (mcpClient) {
          // Add method to clear old contexts
          mcpClient.clearOldContexts = () => {
            try {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('mcp_context_') && key !== 'mcp_context_current') {
                  localStorage.removeItem(key);
                }
              });
              return true;
            } catch (e) {
              console.error('Failed to clear old contexts:', e);
              return false;
            }
          };
          
          // Replace or enhance persistContext method to handle quota errors
          const originalPersistContext = mcpClient.persistContext;
          mcpClient.persistContext = () => {
            try {
              return originalPersistContext.call(mcpClient);
            } catch (error) {
              // If storage quota error, try to clean up and retry
              if (
                error.name === 'QuotaExceededError' ||
                error.message?.includes('quota') ||
                error.message?.includes('storage')
              ) {
                console.error('Storage quota exceeded, cleaning up and retrying...');
                
                // Try clearing old contexts first
                mcpClient.clearOldContexts();
                
                // Try truncating document content in the current context
                try {
                  const context = mcpClient.getModelContext();
                  if (context?.documentContext?.length > 0) {
                    // Truncate all document content
                    const MAX_CONTENT_LENGTH = 5000; // More aggressive truncation
                    context.documentContext = context.documentContext.map(doc => ({
                      ...doc,
                      content: doc.content?.length > MAX_CONTENT_LENGTH 
                        ? doc.content.substring(0, MAX_CONTENT_LENGTH) + ' [content truncated]'
                        : doc.content
                    }));
                    
                    // If still too many documents, keep only the most recent ones
                    if (context.documentContext.length > 5) {
                      context.documentContext = context.documentContext.slice(-5);
                    }
                    
                    // Try to save again
                    return originalPersistContext.call(mcpClient);
                  }
                } catch (truncateError) {
                  console.error('Failed to truncate documents:', truncateError);
                  throw error; // Re-throw the original error
                }
              }
              
              // Re-throw the error if we couldn't handle it
              throw error;
            }
          };
          
          // Add a refreshContext method that safely refreshes the context
          mcpClient.refreshContext = () => {
            try {
              const currentContextId = mcpClient.getCurrentContextId();
              if (currentContextId) {
                return mcpClient.persistContext();
              }
              return false;
            } catch (error) {
              console.error('Error refreshing context:', error);
              return false;
            }
          };
          
          // Add method to get current context ID
          mcpClient.getCurrentContextId = () => {
            try {
              const context = mcpClient.getModelContext();
              return context?.conversationId || null;
            } catch (error) {
              return null;
            }
          };
        }
        
        setClient(mcpClient);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize MCP client:', error);
        toast.error('Failed to initialize document management');
      }
    }
  }, [user]);

  return {
    client,
    isInitialized
  };
}
