
import { useState, useEffect, useRef } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAgentMessages } from './useAgentMessages';
import { useAgentRecommendations } from './useAgentRecommendations';

interface UseAgentMessagesWithRecommendationsProps {
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
  initialMessages?: AgentMessage[];
  conversationId?: string | null;
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
}

export const useAgentMessagesWithRecommendations = ({
  agentType,
  initialMessages = [],
  conversationId,
  onMessageSubmit
}: UseAgentMessagesWithRecommendationsProps) => {
  const [lastUserMessage, setLastUserMessage] = useState<AgentMessage | null>(null);
  
  const agentMessages = useAgentMessages({
    agentType,
    initialMessages,
    conversationId,
    onMessageSubmit
  });

  // Track the last user message for recommendations
  useEffect(() => {
    const userMessages = agentMessages.messages.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      const latest = userMessages[userMessages.length - 1];
      if (!lastUserMessage || latest.id !== lastUserMessage.id) {
        setLastUserMessage(latest);
      }
    }
  }, [agentMessages.messages, lastUserMessage]);

  // Use recommendations hook with the last user message
  const recommendations = useAgentRecommendations(lastUserMessage || {
    id: 'temp',
    sender: 'user',
    message: '',
    timestamp: new Date().toISOString()
  });

  return {
    ...agentMessages,
    recommendations: recommendations.recommendations,
    dismissRecommendation: recommendations.dismissRecommendation,
    hideRecommendation: recommendations.hideRecommendation
  };
};
