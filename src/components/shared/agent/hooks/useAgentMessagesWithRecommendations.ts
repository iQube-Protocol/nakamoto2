
import { useState, useEffect, useRef } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAgentMessages } from './useAgentMessages';
import { useAgentRecommendations } from './useAgentRecommendations';
import { useAgentActivation } from './useAgentActivation';

interface UseAgentMessagesWithRecommendationsProps {
  agentType: 'learn' | 'earn' | 'connect' | 'aigent';
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
    console.log('useAgentMessagesWithRecommendations: Messages changed, total:', agentMessages.messages.length);
    console.log('useAgentMessagesWithRecommendations: All messages:', agentMessages.messages.map(m => ({ sender: m.sender, message: m.message.substring(0, 50) + '...' })));
    
    const userMessages = agentMessages.messages.filter(msg => msg.sender === 'user');
    console.log('useAgentMessagesWithRecommendations: User messages found:', userMessages.length);
    
    if (userMessages.length > 0) {
      const latest = userMessages[userMessages.length - 1];
      console.log('useAgentMessagesWithRecommendations: Latest user message:', { id: latest.id, message: latest.message, sender: latest.sender });
      
      if (!lastUserMessage || latest.id !== lastUserMessage.id) {
        console.log('useAgentMessagesWithRecommendations: Setting new lastUserMessage:', latest.message);
        setLastUserMessage(latest);
      } else {
        console.log('useAgentMessagesWithRecommendations: Same message, not updating');
      }
    } else {
      console.log('useAgentMessagesWithRecommendations: No user messages found');
    }
  }, [agentMessages.messages, lastUserMessage]);

  // Debug the lastUserMessage being passed to recommendations
  useEffect(() => {
    console.log('useAgentMessagesWithRecommendations: lastUserMessage changed to:', lastUserMessage ? { id: lastUserMessage.id, message: lastUserMessage.message, sender: lastUserMessage.sender } : null);
  }, [lastUserMessage]);

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
