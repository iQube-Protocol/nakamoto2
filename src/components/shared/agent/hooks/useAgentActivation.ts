
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SelectedAgent {
  name: string;
  fee: number;
  description: string;
}

// Define the fee structure for each agent
const AGENT_FEES = {
  'KNYT Persona': 0, // Free with reward
  'Qrypto Persona': 200, // One-time payment
  'Metis': 500, // Monthly subscription
  'Venice': 800, // Monthly subscription
};

export const useAgentActivation = () => {
  const { toast } = useToast();
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<SelectedAgent | null>(null);
  const [metisActive, setMetisActive] = useState(false);

  const handleActivateAgent = (agentName: string, fee?: number, description: string = '') => {
    // Use predefined fees if not provided
    const agentFee = fee ?? AGENT_FEES[agentName as keyof typeof AGENT_FEES] ?? 0;
    
    setSelectedAgent({ 
      name: agentName, 
      fee: agentFee, 
      description: description || `Activate ${agentName} to unlock specialized AI capabilities.`
    });
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
      localStorage.setItem('metisActive', 'true');
      window.dispatchEvent(new CustomEvent('metisActivated'));
    }

    if (selectedAgent?.name === 'KNYT Persona') {
      localStorage.setItem('knyt-persona-activated', 'true');
      window.dispatchEvent(new CustomEvent('knytPersonaActivated'));
    }

    if (selectedAgent?.name === 'Qrypto Persona') {
      localStorage.setItem('qrypto-persona-activated', 'true');
      window.dispatchEvent(new CustomEvent('qryptoPersonaActivated'));
    }

    if (selectedAgent?.name === 'Venice') {
      localStorage.setItem('venice_activated', 'true');
      window.dispatchEvent(new CustomEvent('veniceStateChanged', { 
        detail: { activated: true, visible: true } 
      }));
    }
    
    toast({
      title: `${selectedAgent?.name} Agent Activated`,
      description: `You now have access to ${selectedAgent?.name} capabilities.`,
      variant: "default",
    });
    
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
