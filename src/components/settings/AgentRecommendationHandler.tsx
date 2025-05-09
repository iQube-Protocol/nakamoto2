
import React, { useState, useEffect } from 'react';
import AgentRecommendation from '@/components/shared/agent/AgentRecommendation';
import { toast } from 'sonner';
import { useMetisAgent } from '@/hooks/use-metis-agent';

interface AgentRecommendationHandlerProps {
  activeQubes: { [key: string]: boolean };
  setActiveQubes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const AgentRecommendationHandler = ({ 
  activeQubes, 
  setActiveQubes 
}: AgentRecommendationHandlerProps) => {
  const { metisActivated, activateMetis } = useMetisAgent();
  const [showAgentRecommendation, setShowAgentRecommendation] = useState(!metisActivated);

  const handleActivateMetis = () => {
    activateMetis();
    setShowAgentRecommendation(false);
    setActiveQubes(prev => ({...prev, "Metis": true}));
    toast.success("Metis agent activated successfully");
    
    // Dispatch the toggle event to update sidebar
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: "Metis", 
        active: true 
      } 
    });
    window.dispatchEvent(event);
  };
  
  const handleDismissAgent = () => {
    setShowAgentRecommendation(false);
    toast.info("Agent recommendation dismissed");
  };

  return (
    <>
      {showAgentRecommendation && !metisActivated && (
        <AgentRecommendation 
          agentName="Metis"
          description="Advanced analytics agent with crypto risk analysis capabilities"
          fee={5}
          onActivate={handleActivateMetis}
          onDismiss={handleDismissAgent}
        />
      )}
    </>
  );
};

export default AgentRecommendationHandler;
