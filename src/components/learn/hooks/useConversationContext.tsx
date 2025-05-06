
import { useState, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { getConversationContext } from '@/services/agent-service';

export function useConversationContext(conversationId: string | null, setConversationId: (id: string | null) => void) {
  const [historicalContext, setHistoricalContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { client: mcpClient, isInitialized } = useMCP();

  // Load conversation context when component mounts or conversationId changes
  useEffect(() => {
    const loadContext = async () => {
      if (!conversationId) {
        console.log('No conversationId provided, skipping context load');
        return;
      }
      
      setIsLoading(true);
      try {
        const context = await getConversationContext(conversationId, 'learn');
        if (context.historicalContext) {
          setHistoricalContext(context.historicalContext);
          console.log('Loaded historical context for learn agent');
        }
        
        if (context.conversationId !== conversationId) {
          setConversationId(context.conversationId);
        }
        
        // Initialize MCP with this conversation ID
        if (mcpClient && isInitialized) {
          await mcpClient.initializeContext(context.conversationId);
          console.log(`MCP context initialized for conversation ${context.conversationId}`);
        }
      } catch (error) {
        console.error('Error loading conversation context:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContext();
  }, [conversationId, setConversationId, mcpClient, isInitialized]);

  return {
    historicalContext,
    setHistoricalContext,
    isLoading,
    mcpClient
  };
}
