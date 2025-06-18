import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';

interface AgentRecommendationHandlerProps {
  activeQubes: { [key: string]: boolean };
  setActiveQubes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const AgentRecommendationHandler = ({ 
  activeQubes, 
  setActiveQubes 
}: AgentRecommendationHandlerProps) => {
  const { metisActivated, activateMetis } = useMetisAgent();
  const { knytPersonaActivated, activateKNYTPersona } = useKNYTPersona();

  // Listen for agent recommendation events
  useEffect(() => {
    const handleAgentRecommendation = (e: CustomEvent) => {
      const { message, agentType } = e.detail || {};
      
      if (!message) return;
      
      const messageLower = message.toLowerCase();
      
      // Check for Metis trigger words
      const metisTriggers = ['metis', 'risk', 'evaluation', 'security', 'audit', 'wallet', 'token', 'safety', 'analysis'];
      const hasMetisTrigger = metisTriggers.some(trigger => messageLower.includes(trigger));
      
      // Check for KNYT Persona trigger words
      const knytTriggers = ['metaknyts', 'metaiye', 'knowone', 'kn0w1', 'deji', 'fang', 'bat', 'digiterra', 'metaterm', 'terra', 'qryptopia', 'knyt'];
      const hasKNYTTrigger = knytTriggers.some(trigger => messageLower.includes(trigger));
      
      // Activate Metis if trigger words are found and it's not already active
      if (hasMetisTrigger && !metisActivated && !activeQubes["Metis"]) {
        console.log('Metis agent recommended based on trigger words');
        activateMetis();
        setActiveQubes(prev => ({...prev, "Metis": true}));
        
        // Dispatch event to update sidebar
        const event = new CustomEvent('iqubeToggle', { 
          detail: { 
            iqubeId: "Metis", 
            active: true 
          } 
        });
        window.dispatchEvent(event);
        
        toast.info('Metis agent activated for risk analysis');
      }

      // Activate KNYT Persona if trigger words are found and it's not already active
      if (hasKNYTTrigger && !knytPersonaActivated && !activeQubes["KNYT Persona"]) {
        console.log('KNYT Persona recommended based on trigger words');
        activateKNYTPersona();
        setActiveQubes(prev => ({...prev, "KNYT Persona": true}));
        
        // Dispatch event to update sidebar
        const event = new CustomEvent('iqubeToggle', { 
          detail: { 
            iqubeId: "KNYT Persona", 
            active: true 
          } 
        });
        window.dispatchEvent(event);
        
        toast.info('KNYT Persona activated for ecosystem insights');
      }
    };
    
    window.addEventListener('agentRecommendation', handleAgentRecommendation as EventListener);
    
    return () => {
      window.removeEventListener('agentRecommendation', handleAgentRecommendation as EventListener);
    };
  }, [metisActivated, activateMetis, knytPersonaActivated, activateKNYTPersona, activeQubes, setActiveQubes]);

  return null; // This is a logic-only component, no UI
};

export default AgentRecommendationHandler;
