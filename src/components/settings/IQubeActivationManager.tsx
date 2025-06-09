
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

  // Initialize from localStorage on component mount
  useEffect(() => {
    const savedQryptoPersona = localStorage.getItem('qrypto-persona-activated');
    if (savedQryptoPersona !== null) {
      const qryptoPersonaActive = JSON.parse(savedQryptoPersona);
      setActiveQubes(prev => ({...prev, "Qrypto Persona": qryptoPersonaActive}));
    } else {
      // Set default to true and save to localStorage if not found
      setActiveQubes(prev => ({...prev, "Qrypto Persona": true}));
      localStorage.setItem('qrypto-persona-activated', JSON.stringify(true));
    }
  }, [setActiveQubes]);

  // Update active state when metisActivated changes
  useEffect(() => {
    setActiveQubes(prev => ({...prev, "Metis": metisActivated}));
  }, [metisActivated, setActiveQubes]);

  // Save Qrypto Persona state to localStorage whenever it changes
  useEffect(() => {
    if (activeQubes["Qrypto Persona"] !== undefined) {
      localStorage.setItem('qrypto-persona-activated', JSON.stringify(activeQubes["Qrypto Persona"]));
    }
  }, [activeQubes["Qrypto Persona"]]);

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
        } else if (iqubeId === "Qrypto Persona") {
          // Save to localStorage immediately for Qrypto Persona
          localStorage.setItem('qrypto-persona-activated', JSON.stringify(active));
          toast.info(`${iqubeId} ${active ? 'activated' : 'deactivated'}`);
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
