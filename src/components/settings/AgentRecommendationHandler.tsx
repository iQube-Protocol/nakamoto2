
import React, { useState, useEffect } from 'react';
import AgentRecommendation from '@/components/shared/agent/AgentRecommendation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';

interface AgentRecommendationHandlerProps {
  activeQubes: { [key: string]: boolean };
  setActiveQubes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const AgentRecommendationHandler = ({ 
  activeQubes, 
  setActiveQubes 
}: AgentRecommendationHandlerProps) => {
  const { metisActivated, activateMetis } = useMetisAgent();
  const { veniceActivated, activateVenice } = useVeniceAgent();
  const { qryptoPersonaActivated, activateQryptoPersona } = useQryptoPersona();
  
  const [dismissedAgents, setDismissedAgents] = useState<string[]>([]);

  const availableAgents = [
    {
      name: "Metis",
      description: "An algorithm that evaluates risks associated with wallets and tokens for enhanced security analysis.",
      fee: 500,
      activated: metisActivated,
      onActivate: () => {
        activateMetis();
        setActiveQubes(prev => ({...prev, "Metis": true}));
        toast.success("Metis AgentQube activated successfully");
        
        const event = new CustomEvent('iqubeToggle', { 
          detail: { 
            iqubeId: "Metis", 
            active: true 
          } 
        });
        window.dispatchEvent(event);
      }
    },
    {
      name: "Venice",
      description: "AI model service that protects privacy and prevents censorship for secure and unrestricted AI interactions.",
      fee: 800,
      activated: veniceActivated,
      onActivate: () => {
        activateVenice();
        setActiveQubes(prev => ({...prev, "Venice": true}));
        toast.success("Venice ModelQube activated successfully");
        
        const event = new CustomEvent('iqubeToggle', { 
          detail: { 
            iqubeId: "Venice", 
            active: true 
          } 
        });
        window.dispatchEvent(event);
      }
    },
    {
      name: "Qrypto Persona",
      description: "Profile information about the user that enables personalized responses and customized AI interactions.",
      fee: 200,
      activated: qryptoPersonaActivated,
      onActivate: () => {
        activateQryptoPersona();
        setActiveQubes(prev => ({...prev, "Qrypto Persona": true}));
        toast.success("Qrypto Persona DataQube activated successfully");
        
        const event = new CustomEvent('iqubeToggle', { 
          detail: { 
            iqubeId: "Qrypto Persona", 
            active: true 
          } 
        });
        window.dispatchEvent(event);
      }
    }
  ];

  const handleDismissAgent = (agentName: string) => {
    setDismissedAgents(prev => [...prev, agentName]);
    
    // Update toast message to use correct iQube naming
    const agentTitle = agentName === 'Metis' ? 'Metis AgentQube' : 
                     agentName === 'Venice' ? 'Venice ModelQube' : 
                     'Qrypto Persona DataQube';
    toast.info(`${agentTitle} recommendation dismissed`);
  };

  const visibleAgents = availableAgents.filter(agent => 
    !agent.activated && !dismissedAgents.includes(agent.name)
  );

  if (visibleAgents.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 p-1">
          {visibleAgents.map((agent) => (
            <AgentRecommendation 
              key={agent.name}
              agentName={agent.name}
              description={agent.description}
              fee={agent.fee}
              onActivate={agent.onActivate}
              onDismiss={() => handleDismissAgent(agent.name)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default AgentRecommendationHandler;
