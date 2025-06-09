
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';

interface IQubeActivationManagerProps {
  activeQubes: { [key: string]: boolean };
  setActiveQubes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const IQubeActivationManager = ({ 
  activeQubes, 
  setActiveQubes 
}: IQubeActivationManagerProps) => {
  const { metisActivated, metisVisible, activateMetis, hideMetis } = useMetisAgent();
  const { qryptoPersonaActivated, activateQryptoPersona, deactivateQryptoPersona } = useQryptoPersona();

  // Update active states when hook values change
  useEffect(() => {
    setActiveQubes(prev => ({
      ...prev, 
      "Metis": metisActivated,
      "Qrypto Persona": qryptoPersonaActivated
    }));
  }, [metisActivated, qryptoPersonaActivated, setActiveQubes]);

  // Listen for iQube activation/deactivation events from sidebar
  useEffect(() => {
    const handleIQubeToggle = (e: CustomEvent) => {
      const { iqubeId, active } = e.detail || {};
      if (iqubeId) {
        setActiveQubes(prev => ({...prev, [iqubeId]: active}));
        
        // Special handling for each iQube type
        if (iqubeId === "Metis") {
          if (active && !metisActivated) {
            activateMetis();
            toast.info(`Metis activated`);
          } else if (!active && metisVisible) {
            hideMetis();
            toast.info(`Metis deactivated`);
          }
        } else if (iqubeId === "Qrypto Persona") {
          if (active && !qryptoPersonaActivated) {
            activateQryptoPersona();
            toast.info(`Qrypto Persona activated`);
          } else if (!active && qryptoPersonaActivated) {
            deactivateQryptoPersona();
            toast.info(`Qrypto Persona deactivated`);
          }
        } else {
          toast.info(`${iqubeId} ${active ? 'activated' : 'deactivated'}`);
        }
      }
    };
    
    window.addEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    
    return () => {
      window.removeEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    };
  }, [metisActivated, metisVisible, activateMetis, hideMetis, qryptoPersonaActivated, activateQryptoPersona, deactivateQryptoPersona, setActiveQubes]);

  return null; // This is a logic-only component, no UI
};

export default IQubeActivationManager;
