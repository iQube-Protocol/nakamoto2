
import { useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp';
import { toast } from 'sonner';

/**
 * Hook for managing MCP conversation context
 */
export function useMCPContext() {
  // Initialize or get context for a conversation
  const initializeContext = useCallback(async (client: MCPClient | null, conversationId?: string) => {
    if (!client) return null;
    
    try {
      return await client.initializeContext(conversationId);
    } catch (error) {
      console.error('Error initializing MCP context:', error);
      toast.error('Failed to initialize conversation context');
      return null;
    }
  }, []);
  
  return {
    initializeContext
  };
}
