
import { useConversationId } from './useConversationId';
import { useMessageHistory } from './useMessageHistory';
import { useMessageSubmit } from './useMessageSubmit';
import { useScrollToBottom } from './useScrollToBottom';
import { useMessageInput } from './useMessageInput';
import { useAudioControl } from './useAudioControl';
import { useMessageState } from './useMessageState';
import { AgentMessage } from '@/lib/types';
import { useEffect } from 'react';

interface UseAgentMessagesProps {
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
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
  // Use message state hook
  const { messages, setMessages } = useMessageState(initialMessages);
  
  // Use smaller hooks to manage different aspects of functionality
  const {
    inputValue, 
    setInputValue,
    isProcessing, 
    setIsProcessing,
    handleInputChange,
    handleKeyDown
  } = useMessageInput();
  
  const {
    playing,
    handlePlayAudio
  } = useAudioControl();
  
  const { conversationId } = useConversationId(externalConversationId);
  
  // For backend interactions, map 'mondai' to 'learn'
  const backendAgentType = agentType === 'mondai' ? 'learn' : agentType;
  
  const { refreshInteractions } = useMessageHistory(
    backendAgentType, // Use 'learn' for 'mondai' when accessing backend services
    initialMessages,
    setMessages
  );
  
  const { handleSubmit } = useMessageSubmit(
    agentType, // Keep the original UI type for frontend display
    conversationId,
    setMessages,
    setIsProcessing,
    setInputValue,
    refreshInteractions,
    onMessageSubmit
  );
  
  const messagesEndRef = useScrollToBottom(messages);

  // Handler for keyboard events (Enter key press)
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown(e, handleSubmit);
  };

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return {
    messages,
    setMessages,
    inputValue,
    isProcessing,
    playing,
    messagesEndRef,
    conversationId,
    handleInputChange,
    handleSubmit,
    handlePlayAudio,
    handleKeyDown: handleTextareaKeyDown
  };
};
