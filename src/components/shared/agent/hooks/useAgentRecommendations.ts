
import { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useQriptoPersona } from '@/hooks/use-qripto-persona';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';

interface AgentRecommendationState {
  showVeniceRecommendation: boolean;
  showQryptoRecommendation: boolean;
  showKNYTRecommendation: boolean;
}

export const useAgentRecommendations = (message: AgentMessage | null) => {
  console.log('useAgentRecommendations: Hook called with message:', message ? { id: message.id, sender: message.sender, message: message.message } : null);
  
  const [recommendations, setRecommendations] = useState<AgentRecommendationState>({
    showVeniceRecommendation: false,
    showQryptoRecommendation: false,
    showKNYTRecommendation: false,
  });

  // Get current activation states
  const { veniceActivated } = useVeniceAgent();
  const { qriptoPersonaActivated } = useQriptoPersona();
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
      veniceActivated,
      qriptoPersonaActivated,
      knytPersonaActivated
    });
    
    // Clear any existing recommendations first to prevent multiple simultaneous ones
    setRecommendations({
      showVeniceRecommendation: false,
      showQryptoRecommendation: false,
      showKNYTRecommendation: false,
    });
    
    // Venice trigger words: privacy/censorship
    const hasVeniceTrigger = 
      lowerMessage.includes('privacy') || 
      lowerMessage.includes('censorship') ||
      lowerMessage.includes('private') ||
      lowerMessage.includes('secure');
    
    // Qrypto Profile trigger words: personalize/customize
    const hasQryptoTrigger = 
      lowerMessage.includes('personalize') || 
      lowerMessage.includes('personalise') || 
      lowerMessage.includes('customize') || 
      lowerMessage.includes('custom') ||
      lowerMessage.includes('profile') ||
      lowerMessage.includes('preferences');

    // KNYT Persona trigger words
    const knytTriggers = ['metaknyts', 'metaiye', 'knowone', 'kn0w1', 'deji', 'fang', 'bat', 'digiterra', 'metaterm', 'terra', 'qryptopia', 'knyt'];
    const hasKNYTTrigger = knytTriggers.some(trigger => lowerMessage.includes(trigger));
    
    console.log('useAgentRecommendations: Trigger analysis:', {
      hasVeniceTrigger, hasQryptoTrigger, hasKNYTTrigger,
      veniceActivated, qriptoPersonaActivated, knytPersonaActivated
    });

    // Show only one recommendation at a time, prioritizing KNYT > Venice > Qrypto
    let recommendationShown = false;

    if (hasKNYTTrigger && !knytPersonaActivated && !recommendationShown) {
      console.log('useAgentRecommendations: KNYT trigger detected, showing recommendation');
      setTimeout(() => {
        setRecommendations(prev => ({ ...prev, showKNYTRecommendation: true }));
      }, 1000);
      recommendationShown = true;
    }
    
    if (hasVeniceTrigger && !veniceActivated && !recommendationShown) {
      console.log('useAgentRecommendations: Setting Venice recommendation');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showVeniceRecommendation: true })), 1000);
      recommendationShown = true;
    }
    
    if (hasQryptoTrigger && !qriptoPersonaActivated && !recommendationShown) {
      console.log('useAgentRecommendations: Setting Qrypto recommendation');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showQryptoRecommendation: true })), 1000);
      recommendationShown = true;
    }
  }, [message, qriptoPersonaActivated, knytPersonaActivated, veniceActivated]);

  // Auto-dismiss recommendations when agents get activated
  useEffect(() => {
    if (veniceActivated) {
      setRecommendations(prev => ({ ...prev, showVeniceRecommendation: false }));
    }
    if (qriptoPersonaActivated) {
      setRecommendations(prev => ({ ...prev, showQryptoRecommendation: false }));
    }
    if (knytPersonaActivated) {
      setRecommendations(prev => ({ ...prev, showKNYTRecommendation: false }));
    }
  }, [veniceActivated, qriptoPersonaActivated, knytPersonaActivated]);

  // Debug recommendations state changes
  useEffect(() => {
    console.log('useAgentRecommendations: Recommendations state changed:', recommendations);
  }, [recommendations]);

  const dismissRecommendation = (agentName: string) => {
    console.log('useAgentRecommendations: Dismissing recommendation:', agentName);
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
