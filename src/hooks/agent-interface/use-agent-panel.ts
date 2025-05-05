
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getConversationContext } from '@/services/agent-service';
import { useMCP } from '@/hooks/use-mcp';
import { useConversationContext } from '@/hooks/conversation';

interface UseAgentPanelProps {
  agentType: 'learn' | 'earn' | 'connect';
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
}

export const useAgentPanel = ({
  agentType,
  conversationId: externalConversationId,
  setConversationId
}: UseAgentPanelProps) => {
  const { toast } = useToast();
  const { client: mcpClient, isInitialized } = useMCP();
  const { historicalContext, isLoading, documentContextUpdated, setDocumentContextUpdated } = 
    useConversationContext({ 
      conversationId: externalConversationId, 
      setConversationId, 
      agentType 
    });

  // Handle when documents are added or removed - now with debouncing
  const [updateTimeoutId, setUpdateTimeoutId] = useState<number | null>(null);
  
  const handleDocumentContextUpdated = (onDocumentAdded?: () => void) => {
    // Clear any existing timeout to prevent multiple rapid updates
    if (updateTimeoutId) {
      window.clearTimeout(updateTimeoutId);
    }
    
    // Set a new timeout to debounce the update
    const timeoutId = window.setTimeout(() => {
      setDocumentContextUpdated();
      console.log('Document context updated, triggering refresh');
      
      // Call the onDocumentAdded callback if it exists
      if (onDocumentAdded) {
        onDocumentAdded();
      }
    }, 300); // 300ms debounce time
    
    // Store the timeout ID so we can clear it if needed
    setUpdateTimeoutId(timeoutId as unknown as number);
  };
  
  // Clean up any timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutId) {
        window.clearTimeout(updateTimeoutId);
      }
    };
  }, [updateTimeoutId]);

  return {
    toast,
    mcpClient,
    isInitialized,
    historicalContext,
    isLoading,
    documentContextUpdated,
    handleDocumentContextUpdated
  };
};
