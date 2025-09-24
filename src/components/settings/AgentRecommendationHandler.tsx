import React, { useEffect } from 'react';

interface AgentRecommendationHandlerProps {
  activeQubes: { [key: string]: boolean };
  setActiveQubes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const AgentRecommendationHandler = ({ 
  activeQubes, 
  setActiveQubes 
}: AgentRecommendationHandlerProps) => {
  // Listen for activation events to update activeQubes state
  useEffect(() => {
    const handleVeniceActivation = () => {
      setActiveQubes(prev => ({ ...prev, "Venice": true }));
    };

    const handleQriptoActivation = () => {
      setActiveQubes(prev => ({ ...prev, "Qripto Persona": true }));
    };

    const handleKNYTActivation = () => {
      setActiveQubes(prev => ({ ...prev, "KNYT Persona": true }));
    };

    const handleOpenAIActivation = () => {
      setActiveQubes(prev => ({ ...prev, "OpenAI": true }));
    };

    window.addEventListener('veniceStateChanged', handleVeniceActivation);
    window.addEventListener('qriptoPersonaActivated', handleQriptoActivation);
    window.addEventListener('knytPersonaActivated', handleKNYTActivation);
    window.addEventListener('openAIActivated', handleOpenAIActivation);
    
    return () => {
      window.removeEventListener('veniceStateChanged', handleVeniceActivation);
      window.removeEventListener('qriptoPersonaActivated', handleQriptoActivation);
      window.removeEventListener('knytPersonaActivated', handleKNYTActivation);
      window.removeEventListener('openAIActivated', handleOpenAIActivation);
    };
  }, [setActiveQubes]);

  return null; // This is a logic-only component, no UI
};

export default AgentRecommendationHandler;
