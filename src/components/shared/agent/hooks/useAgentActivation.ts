
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface SelectedAgent {
  name: string;
  fee: number;
  description: string;
}

export const useAgentActivation = (onDismissRecommendation?: (agentName: string) => void) => {
  const { toast } = useToast();
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<SelectedAgent | null>(null);
  const [metisActive, setMetisActive] = useState(false);

  const handleActivateAgent = (agentName: string, fee: number, description: string) => {
    setSelectedAgent({ name: agentName, fee, description });
    setShowActivationModal(true);
  };

  const handleConfirmPayment = async (): Promise<boolean> => {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Always succeed for demo purposes
      }, 3000);
    });
  };

  const handleActivationComplete = () => {
    if (selectedAgent?.name === 'Metis') {
      setMetisActive(true);
      window.dispatchEvent(new CustomEvent('metisActivated'));
    }

    if (selectedAgent?.name === 'KNYT Persona') {
      // Dispatch event to activate KNYT Persona
      window.dispatchEvent(new CustomEvent('iqubeToggle', { 
        detail: { 
          iqubeId: "KNYT Persona", 
          active: true 
        } 
      }));
    }

    if (selectedAgent?.name === 'Venice') {
      // Dispatch event to activate Venice
      window.dispatchEvent(new CustomEvent('veniceStateChanged', { 
        detail: { activated: true, visible: true } 
      }));
    }

    if (selectedAgent?.name === 'Qrypto Persona') {
      // Dispatch event to activate Qrypto Persona
      window.dispatchEvent(new CustomEvent('iqubeToggle', { 
        detail: { 
          iqubeId: "Qrypto Persona", 
          active: true 
        } 
      }));
    }
    
    toast({
      title: `${selectedAgent?.name} Agent Activated`,
      description: `You now have access to ${selectedAgent?.name} capabilities.`,
      variant: "default",
    });

    // Dismiss the recommendation after activation
    if (onDismissRecommendation && selectedAgent?.name) {
      onDismissRecommendation(selectedAgent.name);
    }
    
    setSelectedAgent(null);
  };

  const closeActivationModal = () => {
    setShowActivationModal(false);
    setSelectedAgent(null);
  };

  return {
    showActivationModal,
    selectedAgent,
    metisActive,
    handleActivateAgent,
    handleConfirmPayment,
    handleActivationComplete,
    closeActivationModal
  };
};
