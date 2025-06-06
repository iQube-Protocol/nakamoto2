
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useMetisAgent } from '@/hooks/use-metis-agent';

interface IQubeActivationManagerProps {
  activeQubes: { [key: string]: boolean };
  setActiveQubes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const IQubeActivationManager = ({ 
  activeQubes, 
  setActiveQubes 
}: IQubeActivationManagerProps) => {
  const { metisActivated, metisVisible, activateMetis, hideMetis } = useMetisAgent();

  // Update active state when metisActivated changes
  useEffect(() => {
    setActiveQubes(prev => ({...prev, "Metis": metisActivated}));
  }, [metisActivated, setActiveQubes]);

  // Activate Qrypto Persona by default if it's not yet active
  useEffect(() => {
    // Check if Qrypto Persona is not active yet
    if (!activeQubes["Qrypto Persona"]) {
      console.log("Activating Qrypto Persona iQube by default");
      setActiveQubes(prev => ({...prev, "Qrypto Persona": true}));
      
      // Dispatch event to notify other components
      const event = new CustomEvent('iqubeToggle', { 
        detail: { 
          iqubeId: "Qrypto Persona", 
          active: true
        } 
      });
      window.dispatchEvent(event);
    }
  }, [activeQubes, setActiveQubes]);

  // Listen for iQube activation/deactivation events from sidebar
  useEffect(() => {
    const handleIQubeToggle = (e: CustomEvent) => {
      const { iqubeId, active } = e.detail || {};
      if (iqubeId) {
        setActiveQubes(prev => ({...prev, [iqubeId]: active}));
        
        // Special handling for Metis
        if (iqubeId === "Metis") {
          if (active && !metisActivated) {
            activateMetis();
            toast.info(`Metis activated`);
          } else if (!active && metisVisible) {
            hideMetis();
            toast.info(`Metis deactivated`);
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
  }, [metisActivated, metisVisible, activateMetis, hideMetis, setActiveQubes]);

  return null; // This is a logic-only component, no UI
};

export default IQubeActivationManager;
