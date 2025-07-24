
import { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';

interface AgentRecommendationState {
  showMetisRecommendation: boolean;
  showVeniceRecommendation: boolean;
  showQryptoRecommendation: boolean;
  showKNYTRecommendation: boolean;
}

export const useAgentRecommendations = (message: AgentMessage | null) => {
  console.log('useAgentRecommendations: Hook called with message:', message ? { id: message.id, sender: message.sender, message: message.message } : null);
  
  const [recommendations, setRecommendations] = useState<AgentRecommendationState>({
    showMetisRecommendation: false,
    showVeniceRecommendation: false,
    showQryptoRecommendation: false,
    showKNYTRecommendation: false,
  });

  // Get current activation states
  const { metisActivated } = useMetisAgent();
  const { veniceActivated } = useVeniceAgent();
  const { qryptoPersonaActivated } = useQryptoPersona();
  const { knytPersonaActivated } = useKNYTPersona();

  // Check for trigger words in user messages
  useEffect(() => {
    console.log('useAgentRecommendations: useEffect triggered with message:', message ? { sender: message.sender, message: message.message } : null);
    
    // Only process if we have a message and it's from a user
    if (!message || message.sender !== 'user') {
      console.log('useAgentRecommendations: Skipping - no message or not user message:', { message: message?.message, sender: message?.sender });
      return;
    }

    console.log('useAgentRecommendations: Processing message:', { sender: message.sender, message: message.message });
    
    const lowerMessage = message.message.toLowerCase();
    console.log('useAgentRecommendations: Analyzing user message for triggers:', lowerMessage);
    
    console.log('useAgentRecommendations: Current activation states:', {
      metisActivated,
      veniceActivated,
      qryptoPersonaActivated,
      knytPersonaActivated
    });
    
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
    
    console.log('useAgentRecommendations: Trigger analysis:', {
      hasMetisTrigger, hasVeniceTrigger, hasQryptoTrigger, hasKNYTTrigger,
      metisActivated, veniceActivated, qryptoPersonaActivated, knytPersonaActivated
    });

    // Show recommendations with delay, but only if not already activated
    if (hasMetisTrigger && !metisActivated) {
      console.log('useAgentRecommendations: Setting Metis recommendation');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showMetisRecommendation: true })), 1000);
    }
    
    if (hasVeniceTrigger && !veniceActivated) {
      console.log('useAgentRecommendations: Setting Venice recommendation');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showVeniceRecommendation: true })), 1000);
    }
    
    if (hasQryptoTrigger && !qryptoPersonaActivated) {
      console.log('useAgentRecommendations: Setting Qrypto recommendation');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showQryptoRecommendation: true })), 1000);
    }

    if (hasKNYTTrigger && !knytPersonaActivated) {
      console.log('useAgentRecommendations: KNYT trigger detected, showing recommendation');
      console.log('useAgentRecommendations: KNYT state:', { hasKNYTTrigger, knytPersonaActivated });
      setTimeout(() => {
        console.log('useAgentRecommendations: Setting KNYT recommendation to true');
        setRecommendations(prev => ({ ...prev, showKNYTRecommendation: true }));
      }, 1000);
    }

    console.log('useAgentRecommendations: Final logic check - KNYT:', {
      hasKNYTTrigger,
      knytPersonaActivated,
      willShow: hasKNYTTrigger && !knytPersonaActivated
    });
  }, [message, metisActivated, veniceActivated, qryptoPersonaActivated, knytPersonaActivated]);

  // Debug recommendations state changes
  useEffect(() => {
    console.log('useAgentRecommendations: Recommendations state changed:', recommendations);
  }, [recommendations]);

  const dismissRecommendation = (agentName: string) => {
    console.log('useAgentRecommendations: Dismissing recommendation:', agentName);
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
