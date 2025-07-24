
import React from 'react';
import AgentRecommendation from '../AgentRecommendation';
import { useToast } from '@/components/ui/use-toast';

interface AgentRecommendationsProps {
  showVeniceRecommendation: boolean;
  showQryptoRecommendation: boolean;
  showKNYTRecommendation: boolean;
  onActivateAgent: (agentName: string, fee: number, description: string) => void;
  onDismissRecommendation: (agentName: string) => void;
}

const AgentRecommendations = ({
  showVeniceRecommendation,
  showQryptoRecommendation,
  showKNYTRecommendation,
  onActivateAgent,
  onDismissRecommendation
}: AgentRecommendationsProps) => {
  const { toast } = useToast();

  console.log('AgentRecommendations: Received props:', {
    showVeniceRecommendation, 
    showQryptoRecommendation,
    showKNYTRecommendation
  });

  const handleDismissRecommendation = (agentName: string) => {
    onDismissRecommendation(agentName);
    
    toast({
      title: "Recommendation dismissed",
      description: `You can always activate ${agentName} agent later by mentioning relevant keywords again.`,
      variant: "default",
    });
  };

  return (
    <>
      {showVeniceRecommendation && (
        <div className="mt-4">
          <AgentRecommendation
            agentName="Venice"
            description="AI model service that protects privacy and prevents censorship for secure and unrestricted AI interactions."
            fee={800}
            onActivate={() => onActivateAgent('Venice', 800, 'AI model service that protects privacy and prevents censorship for secure and unrestricted AI interactions.')}
            onDismiss={() => handleDismissRecommendation('Venice')}
          />
        </div>
      )}
      
      {showQryptoRecommendation && (
        <div className="mt-4">
          <AgentRecommendation
            agentName="Qrypto Persona"
            description="Profile information about the user that enables personalized responses and customized AI interactions."
            fee={200}
            onActivate={() => onActivateAgent('Qrypto Persona', 200, 'Profile information about the user that enables personalized responses and customized AI interactions.')}
            onDismiss={() => handleDismissRecommendation('Qrypto Persona')}
          />
        </div>
      )}

      {showKNYTRecommendation && (
        <div className="mt-4">
          <AgentRecommendation
            agentName="KNYT Persona"
            description="KNYT ecosystem profile with 2,800 Satoshi reward for completing LinkedIn, MetaMask, and data requirements."
            fee={0}
            onActivate={() => onActivateAgent('KNYT Persona', 0, 'KNYT ecosystem profile with 2,800 Satoshi reward for completing LinkedIn, MetaMask, and data requirements.')}
            onDismiss={() => handleDismissRecommendation('KNYT Persona')}
          />
        </div>
      )}
    </>
  );
};

export default AgentRecommendations;
