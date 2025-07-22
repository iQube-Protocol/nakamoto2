
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
  console.log('🎯 useAgentRecommendations: Hook called with message:', message ? { id: message.id, sender: message.sender, message: message.message.substring(0, 50) + '...' } : null);
  
  const [recommendations, setRecommendations] = useState<AgentRecommendationState>({
    showMetisRecommendation: false,
    showVeniceRecommendation: false,
    showQryptoRecommendation: false,
    showKNYTRecommendation: false,
  });

  // Get current activation states with consistent logging
  const { metisActivated } = useMetisAgent();
  const { veniceActivated } = useVeniceAgent();
  const { qryptoPersonaActivated } = useQryptoPersona();
  const { knytPersonaActivated } = useKNYTPersona();

  // Check for trigger words in the MOST RECENT user message only
  useEffect(() => {
    console.log('🎯 useAgentRecommendations: useEffect triggered');
    
    // Only process if we have a message and it's from a user
    if (!message || message.sender !== 'user') {
      console.log('🎯 useAgentRecommendations: Skipping - no message or not user message');
      return;
    }

    const lowerMessage = message.message.toLowerCase().trim();
    console.log('🎯 useAgentRecommendations: Analyzing MOST RECENT user message for triggers:', lowerMessage);
    
    console.log('🎯 useAgentRecommendations: Current activation states:', {
      metisActivated,
      veniceActivated,
      qryptoPersonaActivated,
      knytPersonaActivated
    });

    // Clear all recommendations first
    setRecommendations({
      showMetisRecommendation: false,
      showVeniceRecommendation: false,
      showQryptoRecommendation: false,
      showKNYTRecommendation: false,
    });

    // Define specific trigger words for each agent with enhanced patterns
    const knytTriggers = [
      'metaknyts', 'metaknyt', 'metaiye', 'knowone', 'kn0w1', 'deji', 'fang', 'bat', 
      'digiterra', 'metaterm', 'terra', 'qryptopia', 'knyt', 'knyt coyn', 'knyt persona'
    ];
    
    const veniceTriggers = [
      'privacy', 'censorship', 'uncensored', 'secure ai', 'private ai', 'venice', 
      'anonymous ai', 'decentralized ai'
    ];
    
    const qryptoTriggers = [
      'personalize', 'personalise', 'customize', 'customise', 'custom', 'profile', 
      'preferences', 'qrypto persona', 'personal data', 'user data'
    ];
    
    const metisTriggers = [
      'risk', 'security', 'audit', 'safe', 'danger', 'scam', 'evaluate', 'metis'
    ];

    // Check triggers - only exact matches to prevent false positives
    const hasKNYTTrigger = knytTriggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    );
    
    const hasVeniceTrigger = veniceTriggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    );
    
    const hasQryptoTrigger = qryptoTriggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    );
    
    const hasMetisTrigger = metisTriggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    ) && (lowerMessage.includes('token') || lowerMessage.includes('wallet') || lowerMessage.includes('crypto'));

    console.log('🎯 useAgentRecommendations: Trigger analysis:', {
      hasKNYTTrigger, 
      hasVeniceTrigger, 
      hasQryptoTrigger, 
      hasMetisTrigger,
      knytActivated: knytPersonaActivated, 
      veniceActivated, 
      qryptoActivated: qryptoPersonaActivated, 
      metisActivated
    });

    // Priority system: KNYT > Venice > Qrypto > Metis
    // Only show recommendation if agent is NOT already activated
    if (hasKNYTTrigger && !knytPersonaActivated) {
      console.log('🎯 useAgentRecommendations: Setting KNYT recommendation (highest priority)');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showKNYTRecommendation: true })), 500);
    } else if (hasVeniceTrigger && !veniceActivated) {
      console.log('🎯 useAgentRecommendations: Setting Venice recommendation');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showVeniceRecommendation: true })), 500);
    } else if (hasQryptoTrigger && !qryptoPersonaActivated) {
      console.log('🎯 useAgentRecommendations: Setting Qrypto recommendation');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showQryptoRecommendation: true })), 500);
    } else if (hasMetisTrigger && !metisActivated) {
      console.log('🎯 useAgentRecommendations: Setting Metis recommendation');
      setTimeout(() => setRecommendations(prev => ({ ...prev, showMetisRecommendation: true })), 500);
    } else {
      console.log('🎯 useAgentRecommendations: No recommendations triggered - either no triggers or agents already activated');
    }

  }, [message?.id, message?.message, metisActivated, veniceActivated, qryptoPersonaActivated, knytPersonaActivated]);

  // Debug recommendations state changes
  useEffect(() => {
    console.log('🎯 useAgentRecommendations: Recommendations state changed:', recommendations);
  }, [recommendations]);

  const dismissRecommendation = (agentName: string) => {
    console.log('🎯 useAgentRecommendations: Dismissing recommendation:', agentName);
    setRecommendations(prev => ({
      ...prev,
      showMetisRecommendation: agentName === 'Metis' ? false : prev.showMetisRecommendation,
      showVeniceRecommendation: agentName === 'Venice' ? false : prev.showVeniceRecommendation,
      showQryptoRecommendation: agentName === 'Qrypto Persona' ? false : prev.showQryptoRecommendation,
      showKNYTRecommendation: agentName === 'KNYT Persona' ? false : prev.showKNYTRecommendation,
    }));
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
