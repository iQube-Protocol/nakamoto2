
import { useConversationId } from './useConversationId';
import { useMessageHistory } from './useMessageHistory';
import { useMessageSubmit } from './useMessageSubmit';
import { useScrollToBottom } from './useScrollToBottom';
import { useMessageInput } from './useMessageInput';
import { useAudioControl } from './useAudioControl';
import { useMessageState } from './useMessageState';
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
  // Use message state hook
  const { messages, setMessages } = useMessageState(initialMessages);
  
  // Use smaller hooks to manage different aspects of functionality
  const {
    inputValue, 
    setInputValue,
    isProcessing, 
    setIsProcessing,
    handleInputChange
  } = useMessageInput();
  
  const {
    playing,
    handlePlayAudio
  } = useAudioControl();
  
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
    setMessages,
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
