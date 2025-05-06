
import { useState, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { getConversationContext } from '@/services/agent-service';

export function useConversationContext(conversationId: string | null, setConversationId: (id: string | null) => void) {
  const [historicalContext, setHistoricalContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { client: mcpClient, isInitialized, initializeContext } = useMCP();

  // Load conversation context when component mounts or conversationId changes
  useEffect(() => {
    const loadContext = async () => {
      if (!isInitialized) {
        console.log('MCP not initialized yet, waiting...');
        return;
      }
      
      setIsLoading(true);
      try {
        let contextConversationId = conversationId;
        
        if (conversationId) {
          // Try to load existing context
          const context = await getConversationContext(conversationId, 'learn');
          if (context.historicalContext) {
            setHistoricalContext(context.historicalContext);
            console.log('Loaded historical context for learn agent');
          }
          
          if (context.conversationId !== conversationId) {
            contextConversationId = context.conversationId;
            setConversationId(context.conversationId);
          }
        }
        
        // Initialize MCP with this conversation ID
        if (mcpClient) {
          const mcpConversationId = await initializeContext(contextConversationId);
          
          if (mcpConversationId && (!contextConversationId || mcpConversationId !== contextConversationId)) {
            setConversationId(mcpConversationId);
            console.log(`Setting new conversation ID from MCP: ${mcpConversationId}`);
          }
          
          console.log(`MCP context initialized for conversation ${mcpConversationId || 'new'}`);
        }
      } catch (error) {
        console.error('Error loading conversation context:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContext();
  }, [conversationId, setConversationId, mcpClient, isInitialized, initializeContext]);

  return {
    historicalContext,
    setHistoricalContext,
    isLoading,
    mcpClient
  };
}
