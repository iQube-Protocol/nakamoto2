
import { useState, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';

/**
 * Hook to manage conversation ID and MCP context initialization
 */
export const useConversationId = (externalConversationId: string | null | undefined) => {
  const [conversationId, setConversationId] = useState<string | null>(externalConversationId || null);
  const { client: mcpClient, initializeContext } = useMCP();
  
  // Initialize MCP context when component mounts
  useEffect(() => {
    const setupMCP = async () => {
      if (mcpClient) {
        // If external conversation ID is provided, use it, otherwise initialize new
        const convId = await initializeContext(externalConversationId);
        if (convId) {
          console.log(`MCP: Initialized context for agent with ID: ${convId}`);
          setConversationId(convId);
        }
      }
    };
    
    setupMCP();
  }, [mcpClient, initializeContext, externalConversationId]);
  
  // Update conversationId if external one changes
  useEffect(() => {
    if (externalConversationId !== undefined && externalConversationId !== conversationId) {
      setConversationId(externalConversationId);
    }
  }, [externalConversationId, conversationId]);
  
  return { conversationId };
};
