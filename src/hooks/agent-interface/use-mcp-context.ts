
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UseMCPContextProps {
  mcpClient: any;
  initializeContext: (conversationId?: string) => Promise<string | null>;
  agentType: string;
  externalConversationId: string | null;
  setConversationId: (id: string | null) => void;
}

export const useMCPContext = ({
  mcpClient,
  initializeContext,
  agentType,
  externalConversationId,
  setConversationId
}: UseMCPContextProps) => {
  const [conversationId, setInternalConversationId] = useState<string | null>(externalConversationId || null);

  // Initialize MCP context when component mounts
  useEffect(() => {
    const setupMCP = async () => {
      if (mcpClient) {
        // If external conversation ID is provided, use it, otherwise initialize new
        const convId = await initializeContext(externalConversationId);
        if (convId) {
          console.log(`MCP: Initialized context for ${agentType} agent with ID: ${convId}`);
          setInternalConversationId(convId);
          setConversationId(convId);
        }
      }
    };
    
    setupMCP();
  }, [mcpClient, initializeContext, agentType, externalConversationId, setConversationId]);
  
  // Update conversationId if external one changes
  useEffect(() => {
    if (externalConversationId !== undefined && externalConversationId !== conversationId) {
      setInternalConversationId(externalConversationId);
    }
  }, [externalConversationId, conversationId]);

  const handleDocumentAdded = () => {
    // Refresh the messages or notify the user
    toast.success('Document context has been updated');
    return true;
  };

  return {
    conversationId,
    handleDocumentAdded
  };
};
