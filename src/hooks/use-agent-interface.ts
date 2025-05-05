
import { useState } from 'react';
import { AgentMessage } from '@/lib/types';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { useAuth } from '@/hooks/use-auth';
import { useMCP } from '@/hooks/use-mcp';
import { 
  useMessages,
  useConversationHistory,
  useMCPContext
} from '@/hooks/agent-interface';

interface UseAgentInterfaceProps {
  agentType: 'learn' | 'earn' | 'connect';
  initialMessages: AgentMessage[];
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
  onDocumentAdded?: () => void;
}

export const useAgentInterface = ({
  agentType,
  initialMessages,
  conversationId: externalConversationId,
  setConversationId,
  onMessageSubmit,
  onDocumentAdded
}: UseAgentInterfaceProps) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge' | 'documents'>('chat');
  
  const { user } = useAuth();
  const { interactions, refreshInteractions } = useUserInteractions(agentType);
  const { client: mcpClient, initializeContext } = useMCP();

  // Use the messages hook
  const { 
    messages, 
    inputValue, 
    isProcessing, 
    playing, 
    messagesEndRef,
    handleInputChange,
    handleSubmit,
    handlePlayAudio,
    setMessages
  } = useMessages({
    agentType,
    initialMessages,
    conversationId: externalConversationId,
    onMessageSubmit,
    refreshInteractions,
    user
  });

  // Use the conversation history hook
  useConversationHistory({
    initialMessages,
    interactions,
    refreshInteractions,
    agentType,
    user,
    setMessages
  });

  // Use the MCP context hook
  const { 
    conversationId,
    handleDocumentAdded: handleMCPDocumentAdded
  } = useMCPContext({
    mcpClient,
    initializeContext,
    agentType,
    externalConversationId,
    setConversationId
  });

  // Wrapper for document added handler to call both internal and external handlers
  const handleDocumentAdded = () => {
    handleMCPDocumentAdded();
    
    // Call the parent's onDocumentAdded if provided
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };

  return {
    messages,
    inputValue,
    isProcessing,
    activeTab,
    playing,
    messagesEndRef,
    conversationId,
    handleInputChange,
    handleSubmit,
    handlePlayAudio,
    handleDocumentAdded,
    setActiveTab
  };
};
