
import { useCallback, useState } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { toast } from 'sonner';
import { RetryService } from '@/services/RetryService';

/**
 * Hook for handling conversation context functionality
 */
export function useConversationContext(client: MCPClient | null) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const retryService = new RetryService({
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000
  });
  
  // Initialize or get context for a conversation with enhanced error handling
  const initializeContext = useCallback(async (conversationId?: string): Promise<string | null> => {
    if (!client) {
      console.warn('Cannot initialize context: MCP client not available');
      return null;
    }
    
    setIsInitializing(true);
    
    try {
      // Use retry service to handle transient failures
      const convId = await retryService.execute(async () => {
        try {
          const id = await client.initializeContext(conversationId);
          console.log(`MCP context initialized with ID: ${id}`);
          return id;
        } catch (error) {
          console.error('Error in MCP context initialization:', error);
          throw error; // Allow retry service to handle it
        }
      });
      
      setActiveConversationId(convId);
      return convId;
    } catch (error) {
      console.error('Failed to initialize MCP context after retries:', error);
      toast.error('Failed to initialize conversation context', {
        description: 'Document features may be limited'
      });
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [client, retryService]);
  
  return {
    initializeContext,
    isInitializing,
    activeConversationId
  };
}
