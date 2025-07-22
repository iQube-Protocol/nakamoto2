
import { useState, useEffect, useRef } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAgentMessages } from './useAgentMessages';
import { useAgentRecommendations } from './useAgentRecommendations';
import { useAgentActivation } from './useAgentActivation';

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

  // Use the agent activation hook
  const agentActivation = useAgentActivation();

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

  // Use recommendations hook with the actual last user message (or null if no user messages yet)
  const recommendations = useAgentRecommendations(lastUserMessage);

  // Handle agent activation using the proper activation flow
  const handleActivateAgent = (agentName: string, fee: number, description: string) => {
    console.log(`Activating agent through modal: ${agentName}`);
    agentActivation.handleActivateAgent(agentName, fee, description);
  };

  return {
    ...agentMessages,
    recommendations: recommendations.recommendations,
    dismissRecommendation: recommendations.dismissRecommendation,
    hideRecommendation: recommendations.hideRecommendation,
    onActivateAgent: handleActivateAgent,
    // Expose agent activation modal properties
    agentActivation
  };
};
