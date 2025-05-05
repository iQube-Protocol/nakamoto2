
import { useState, useEffect } from 'react';
import { getConversationContext } from '@/services/agent-service';
import { useMCP } from '@/hooks/use-mcp';

interface UseConversationContextProps {
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  agentType: 'learn' | 'earn' | 'connect';
}

interface UseConversationContextReturn {
  historicalContext: string;
  isLoading: boolean;
  documentContextUpdated: number;
  setDocumentContextUpdated: React.Dispatch<React.SetStateAction<number>>;
}

export const useConversationContext = ({
  conversationId,
  setConversationId,
  agentType
}: UseConversationContextProps): UseConversationContextReturn => {
  const [historicalContext, setHistoricalContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [documentContextUpdated, setDocumentContextUpdated] = useState<number>(0);
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
        const context = await getConversationContext(conversationId, agentType);
        if (context.historicalContext) {
          setHistoricalContext(context.historicalContext);
          console.log(`Loaded historical context for ${agentType} agent`);
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
  }, [conversationId, setConversationId, mcpClient, isInitialized, agentType]);

  return {
    historicalContext,
    isLoading,
    documentContextUpdated,
    setDocumentContextUpdated
  };
};
