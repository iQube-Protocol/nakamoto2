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

    const handleQryptoActivation = () => {
      setActiveQubes(prev => ({ ...prev, "Qrypto Persona": true }));
    };

    const handleKNYTActivation = () => {
      setActiveQubes(prev => ({ ...prev, "KNYT Persona": true }));
    };

    window.addEventListener('veniceStateChanged', handleVeniceActivation);
    window.addEventListener('qryptoPersonaActivated', handleQryptoActivation);
    window.addEventListener('knytPersonaActivated', handleKNYTActivation);
    
    return () => {
      window.removeEventListener('veniceStateChanged', handleVeniceActivation);
      window.removeEventListener('qryptoPersonaActivated', handleQryptoActivation);
      window.removeEventListener('knytPersonaActivated', handleKNYTActivation);
    };
  }, [setActiveQubes]);

  return null; // This is a logic-only component, no UI
};

export default AgentRecommendationHandler;
