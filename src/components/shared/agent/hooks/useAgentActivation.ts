
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

  const handleActivateAgent = (agentName: string, fee?: number, description: string = '') => {
    console.log('🎯 useAgentActivation: Activating agent:', agentName);
    
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
    console.log('🎯 useAgentActivation: Processing payment for:', selectedAgent?.name);
    
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🎯 useAgentActivation: Payment processed successfully');
        resolve(true); // Always succeed for demo purposes
      }, 3000);
    });
  };

  const handleActivationComplete = () => {
    if (!selectedAgent) return;
    
    console.log('🎯 useAgentActivation: Completing activation for:', selectedAgent.name);
    
    // Handle activation using consistent localStorage keys and events
    if (selectedAgent.name === 'Metis') {
      localStorage.setItem('metisActive', 'true');
      window.dispatchEvent(new CustomEvent('metisActivated'));
    } else if (selectedAgent.name === 'KNYT Persona') {
      localStorage.setItem('knyt-persona-activated', 'true');
      window.dispatchEvent(new CustomEvent('knytPersonaActivated'));
    } else if (selectedAgent.name === 'Qrypto Persona') {
      localStorage.setItem('qrypto-persona-activated', 'true');
      window.dispatchEvent(new CustomEvent('qryptoPersonaActivated'));
    } else if (selectedAgent.name === 'Venice') {
      localStorage.setItem('venice_activated', 'true');
      window.dispatchEvent(new CustomEvent('veniceStateChanged', { 
        detail: { activated: true, visible: true } 
      }));
    }
    
    toast({
      title: `${selectedAgent.name} Agent Activated`,
      description: `You now have access to ${selectedAgent.name} capabilities.`,
      variant: "default",
    });
    
    setSelectedAgent(null);
  };

  const closeActivationModal = () => {
    console.log('🎯 useAgentActivation: Closing activation modal');
    setShowActivationModal(false);
    setSelectedAgent(null);
  };

  return {
    showActivationModal,
    selectedAgent,
    handleActivateAgent,
    handleConfirmPayment,
    handleActivationComplete,
    closeActivationModal
  };
};
