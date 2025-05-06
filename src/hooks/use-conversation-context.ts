
import { useState, useEffect, useRef, useCallback } from 'react';
import { getConversationContext } from '@/services/agent-service';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

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
  const loadingRef = useRef(false);
  const previousConversationIdRef = useRef<string | null>(null);
  const contextInitializedRef = useRef(false);
  
  // Function to handle localStorage errors
  const handleStorageError = useCallback((error: any) => {
    if (
      error?.name === 'QuotaExceededError' || 
      error?.message?.includes('quota') ||
      error?.message?.includes('storage')
    ) {
      console.error('Storage quota exceeded, clearing some data');
      toast.error(
        'Storage quota exceeded', 
        { description: 'Some document content may be truncated to save space' }
      );
      
      // Try to reclaim space by clearing non-essential storage
      try {
        // Clear any old contexts
        if (mcpClient) {
          mcpClient.clearOldContexts();
        }
      } catch (clearError) {
        console.error('Failed to clear old contexts:', clearError);
      }
    }
  }, [mcpClient]);
  
  // Load conversation context when component mounts or conversationId changes
  const loadContext = useCallback(async () => {
    // Skip if no conversation ID or already loading
    if (!conversationId || loadingRef.current) return;
    
    // Skip if conversation ID hasn't changed to avoid redundant loads
    if (conversationId === previousConversationIdRef.current && contextInitializedRef.current) {
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    previousConversationIdRef.current = conversationId;
    
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
        try {
          await mcpClient.initializeContext(context.conversationId);
          contextInitializedRef.current = true;
          console.log(`MCP context initialized for conversation ${context.conversationId}`);
        } catch (error) {
          console.error('Error initializing MCP context:', error);
          handleStorageError(error);
        }
      }
    } catch (error) {
      console.error('Error loading conversation context:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [conversationId, setConversationId, mcpClient, isInitialized, agentType, handleStorageError]);
  
  // Effect to load context when conversation ID changes
  useEffect(() => {
    loadContext();
  }, [loadContext]);
  
  // Effect to handle document context updates
  useEffect(() => {
    if (documentContextUpdated <= 0 || !conversationId) return;
    
    // If documents were added/removed, we should refresh the context
    console.log(`Document context updated (${documentContextUpdated}), refreshing...`);
    
    // Only update the MCP context if we're already initialized
    if (contextInitializedRef.current && mcpClient && isInitialized) {
      try {
        mcpClient.refreshContext();
      } catch (error) {
        console.error('Error refreshing MCP context:', error);
        handleStorageError(error);
      }
    }
  }, [documentContextUpdated, conversationId, mcpClient, isInitialized, handleStorageError]);

  return {
    historicalContext,
    isLoading,
    documentContextUpdated,
    setDocumentContextUpdated
  };
};
