
import { useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { toast } from 'sonner';

/**
 * Hook for handling conversation context functionality
 */
export function useConversationContext(client: MCPClient | null) {
  // Initialize or get context for a conversation
  const initializeContext = useCallback(async (conversationId?: string) => {
    if (!client) return null;
    
    try {
      return await client.initializeContext(conversationId);
    } catch (error) {
      console.error('Error initializing MCP context:', error);
      toast.error('Failed to initialize conversation context');
      return null;
    }
  }, [client]);
  
  return {
    initializeContext
  };
}
