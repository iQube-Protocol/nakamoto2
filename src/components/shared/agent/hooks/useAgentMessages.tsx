
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useUserInteractionsOptimized } from '@/hooks/use-user-interactions-optimized';
import { useMessageHistory } from './useMessageHistory';
import { useMessageSubmit } from './useMessageSubmit';
import { useMessageInput } from './useMessageInput';
import { useMessageState } from './useMessageState';
import { useAudioControl } from './useAudioControl';
import { useScrollToBottom } from './useScrollToBottom';
import { useConversationId } from './useConversationId';

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
  const { user } = useAuth();
  const { refreshInteractions } = useUserInteractionsOptimized(
    agentType === 'mondai' ? 'learn' : agentType
  );
  
  // Memoize initial messages to prevent unnecessary re-renders
  const memoizedInitialMessages = useMemo(() => initialMessages, [initialMessages]);
  
  // State management hooks
  const { messages, setMessages, isProcessing, setIsProcessing } = useMessageState(memoizedInitialMessages);
  const { inputValue, setInputValue, handleInputChange, handleKeyDown } = useMessageInput();
  const { playing, handlePlayAudio } = useAudioControl();
  const { messagesEndRef } = useScrollToBottom(messages);
  const { conversationId } = useConversationId(externalConversationId);
  
  // Message history hook (only for non-mondai agents)
  useMessageHistory(
    agentType === 'mondai' ? 'learn' : agentType,
    memoizedInitialMessages,
    setMessages
  );
  
  // Message submission hook with memoized callback
  const { handleSubmit } = useMessageSubmit(
    agentType === 'mondai' ? 'learn' : agentType,
    conversationId,
    setMessages,
    setIsProcessing,
    setInputValue,
    refreshInteractions,
    onMessageSubmit
  );

  // Memoized handle submit to prevent unnecessary re-renders
  const memoizedHandleSubmit = useCallback(handleSubmit, [handleSubmit]);

  return {
    messages,
    setMessages,
    inputValue,
    isProcessing,
    playing,
    messagesEndRef,
    conversationId,
    handleInputChange,
    handleSubmit: memoizedHandleSubmit,
    handlePlayAudio,
    handleKeyDown
  };
};
