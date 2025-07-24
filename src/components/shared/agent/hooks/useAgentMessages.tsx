
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
  const { messages, setMessages } = useMessageState(initialMessages);
  
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
  
  const { refreshInteractions } = useMessageHistory(
    agentType, // Now properly supports 'mondai' as a valid type
    initialMessages,
    setMessages
  );
  
  const { handleSubmit } = useMessageSubmit(
    agentType, // Now properly supports 'mondai' as a valid type
    conversationId,
    setMessages,
    setIsProcessing,
    setInputValue,
    refreshInteractions,
    onMessageSubmit
  );
  
  const messagesEndRef = useScrollToBottom(messages);

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown(e, handleSubmit);
  };

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
