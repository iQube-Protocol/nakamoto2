
import { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useMessageHandling } from './agent/use-message-handling';
import { useConversationTracking } from './agent/use-conversation-tracking';
import { useTabManagement } from './agent/use-tab-management';
import { useHistoryLoading } from './agent/use-history-loading';
import { useDocumentHandling } from './agent/use-document-handling';

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
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  
  // Use smaller, focused hooks
  const { activeTab, setActiveTab, switchToChatTab } = useTabManagement('chat');
  
  const {
    messages,
    isProcessing,
    handleSubmit,
    setMessages
  } = useMessageHandling({
    agentType,
    user,
    onMessageSubmit,
    conversationId: externalConversationId
  });
  
  const {
    playing,
    isHistoryLoaded,
    setIsHistoryLoaded,
    conversationId,
    messagesEndRef,
    handlePlayAudio
  } = useConversationTracking({
    initialMessages,
    conversationId: externalConversationId,
    setConversationId,
    agentType
  });
  
  // Load message history
  useHistoryLoading({
    agentType,
    initialMessages,
    isHistoryLoaded,
    setIsHistoryLoaded,
    setMessages
  });
  
  const { handleDocumentAdded } = useDocumentHandling();

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    // Always switch to chat tab when submitting a message
    switchToChatTab();

    const success = await handleSubmit(inputValue);
    if (success) {
      setInputValue('');
    }
  };

  const handleDocumentContextUpdated = () => {
    handleDocumentAdded(onDocumentAdded);
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
    handleSubmit: handleFormSubmit,
    handlePlayAudio,
    handleDocumentAdded: handleDocumentContextUpdated,
    setActiveTab
  };
};
