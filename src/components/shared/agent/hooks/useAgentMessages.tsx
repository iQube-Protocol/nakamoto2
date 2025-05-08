
import { useRef } from 'react';
import { useMessageState } from './useMessageState';
import { useConversationId } from './useConversationId';
import { useMessageHistory } from './useMessageHistory';
import { useMessageSubmit } from './useMessageSubmit';
import { useScrollToBottom } from './useScrollToBottom';
import { AgentMessage } from '@/lib/types';

interface UseAgentMessagesProps {
  agentType: 'learn' | 'earn' | 'connect';
  initialMessages?: AgentMessage[];
  conversationId?: string | null;
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
}

export const useAgentMessages = ({
  agentType,
  initialMessages = [],
  conversationId: externalConversationId,
  onMessageSubmit
}: UseAgentMessagesProps) => {
  // Use smaller hooks to manage different aspects of functionality
  const {
    messages, 
    setMessages,
    inputValue, 
    setInputValue,
    isProcessing, 
    setIsProcessing,
    playing,
    handleInputChange,
    handlePlayAudio
  } = useMessageState(initialMessages);
  
  const { conversationId } = useConversationId(externalConversationId);
  
  const { refreshInteractions } = useMessageHistory(
    agentType,
    initialMessages,
    setMessages
  );
  
  const { handleSubmit } = useMessageSubmit(
    agentType,
    conversationId,
    setMessages,
    setIsProcessing,
    setInputValue,
    refreshInteractions,
    onMessageSubmit
  );
  
  const messagesEndRef = useScrollToBottom(messages);

  return {
    messages,
    inputValue,
    isProcessing,
    playing,
    messagesEndRef,
    conversationId,
    handleInputChange,
    handleSubmit,
    handlePlayAudio,
  };
};
