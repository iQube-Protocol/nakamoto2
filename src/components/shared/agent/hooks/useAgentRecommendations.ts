
import { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';

interface AgentRecommendationState {
  showMetisRecommendation: boolean;
  showVeniceRecommendation: boolean;
  showQryptoRecommendation: boolean;
  showKNYTRecommendation: boolean;
}

export const useAgentRecommendations = (message: AgentMessage) => {
  const [recommendations, setRecommendations] = useState<AgentRecommendationState>({
    showMetisRecommendation: false,
    showVeniceRecommendation: false,
    showQryptoRecommendation: false,
    showKNYTRecommendation: false,
  });

  // Check for trigger words in user messages
  useEffect(() => {
    if (message.sender === 'user') {
      const lowerMessage = message.message.toLowerCase();
      
      // Metis trigger words: crypto-risk related
      const hasMetisTrigger = 
        lowerMessage.includes('risk') && 
        (lowerMessage.includes('token') || 
         lowerMessage.includes('wallet') || 
         lowerMessage.includes('crypto') || 
         lowerMessage.includes('blockchain'));
      
      // Venice trigger words: privacy/censorship
      const hasVeniceTrigger = 
        lowerMessage.includes('privacy') || 
        lowerMessage.includes('censorship');
      
      // Qrypto Profile trigger words: personalize/customize
      const hasQryptoTrigger = 
        lowerMessage.includes('personalize') || 
        lowerMessage.includes('personalise') || 
        lowerMessage.includes('customize') || 
        lowerMessage.includes('custom');

      // KNYT Persona trigger words
      const knytTriggers = ['metaknyts', 'metaiye', 'knowone', 'kn0w1', 'deji', 'fang', 'bat', 'digiterra', 'metaterm', 'terra', 'qryptopia', 'knyt'];
      const hasKNYTTrigger = knytTriggers.some(trigger => lowerMessage.includes(trigger));
      
      // Show recommendations with delay
      if (hasMetisTrigger) {
        setTimeout(() => setRecommendations(prev => ({ ...prev, showMetisRecommendation: true })), 1000);
      }
      
      if (hasVeniceTrigger) {
        setTimeout(() => setRecommendations(prev => ({ ...prev, showVeniceRecommendation: true })), 1000);
      }
      
      if (hasQryptoTrigger) {
        setTimeout(() => setRecommendations(prev => ({ ...prev, showQryptoRecommendation: true })), 1000);
      }

      if (hasKNYTTrigger) {
        setTimeout(() => setRecommendations(prev => ({ ...prev, showKNYTRecommendation: true })), 1000);
      }
    }
  }, [message]);

  const dismissRecommendation = (agentName: string) => {
    if (agentName === 'Metis') setRecommendations(prev => ({ ...prev, showMetisRecommendation: false }));
    if (agentName === 'Venice') setRecommendations(prev => ({ ...prev, showVeniceRecommendation: false }));
    if (agentName === 'Qrypto Persona') setRecommendations(prev => ({ ...prev, showQryptoRecommendation: false }));
    if (agentName === 'KNYT Persona') setRecommendations(prev => ({ ...prev, showKNYTRecommendation: false }));
  };

  const hideRecommendation = (agentName: string) => {
    dismissRecommendation(agentName);
  };

  return {
    recommendations,
    dismissRecommendation,
    hideRecommendation
  };
};
