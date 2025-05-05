
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

  // Handle when documents are added or removed
  const handleDocumentContextUpdated = (onDocumentAdded?: () => void) => {
    setDocumentContextUpdated();
    console.log('Document context updated, triggering refresh');
    
    // Call the onDocumentAdded callback if it exists
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };

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
