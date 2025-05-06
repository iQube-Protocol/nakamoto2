
import { useState, useEffect } from 'react';

export function useMetisActivation() {
  const [metisActive, setMetisActive] = useState<boolean>(false);

  useEffect(() => {
    // Check if Metis is already activated via localStorage
    const storedMetisActive = localStorage.getItem('metisActive');
    if (storedMetisActive === 'true') {
      setMetisActive(true);
      console.log('AgentPanel: Metis already active from localStorage');
    }

    const handleMetisActivated = () => {
      setMetisActive(true);
      console.log('AgentPanel: Metis agent activated via custom event');
    };

    window.addEventListener('metisActivated', handleMetisActivated);
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
    };
  }, []);

  const activateMetis = () => {
    setMetisActive(true);
    localStorage.setItem('metisActive', 'true');
    
    // Dispatch global event to notify other components
    const activationEvent = new Event('metisActivated');
    window.dispatchEvent(activationEvent);
    
    console.log('Metis agent status updated to: active');
  };

  return { metisActive, setMetisActive, activateMetis };
}
