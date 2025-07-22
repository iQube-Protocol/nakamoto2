
import { useState, useEffect, useRef } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAgentMessages } from './useAgentMessages';
import { useAgentRecommendations } from './useAgentRecommendations';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { toast } from 'sonner';

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

  // Get persona hooks
  const { activateKNYTPersona } = useKNYTPersona();
  const { activateQryptoPersona } = useQryptoPersona();
  const { activateMetis } = useMetisAgent();
  const { activateVenice } = useVeniceAgent();

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

  // Use recommendations hook with the last user message - only if we have one
  const recommendations = useAgentRecommendations(lastUserMessage || {
    id: 'temp',
    sender: 'agent', // Changed to 'agent' so it won't trigger recommendation logic
    message: '',
    timestamp: new Date().toISOString()
  });

  // Handle agent activation
  const handleActivateAgent = (agentName: string, fee: number, description: string) => {
    console.log(`Activating agent: ${agentName}`);
    
    switch (agentName) {
      case 'KNYT Persona':
        activateKNYTPersona();
        toast.success('KNYT Persona activated successfully! You now have access to KNYT ecosystem features.');
        break;
      case 'Qrypto Persona':
        activateQryptoPersona();
        toast.success('Qrypto Persona activated! Your AI interactions are now personalized.');
        break;
      case 'Metis':
        activateMetis();
        toast.success('Metis agent activated! Enhanced crypto security analysis is now available.');
        break;
      case 'Venice':
        activateVenice();
        toast.success('Venice agent activated! Privacy-focused AI interactions are now enabled.');
        break;
      default:
        console.warn(`Unknown agent: ${agentName}`);
    }
  };

  return {
    ...agentMessages,
    recommendations: recommendations.recommendations,
    dismissRecommendation: recommendations.dismissRecommendation,
    hideRecommendation: recommendations.hideRecommendation,
    onActivateAgent: handleActivateAgent
  };
};
