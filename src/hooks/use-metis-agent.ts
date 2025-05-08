
import { useState, useEffect } from 'react';

export function useMetisAgent() {
  const [metisActivated, setMetisActivated] = useState(false);
  const [metisVisible, setMetisVisible] = useState(false);

  useEffect(() => {
    const handleMetisActivated = () => {
      console.log('Metis agent activation detected');
      setMetisActivated(true);
      setMetisVisible(true);
    };

    window.addEventListener('metisActivated', handleMetisActivated);
    
    // Check localStorage only after component mounts
    const metisActiveStatus = localStorage.getItem('metisActive');
    if (metisActiveStatus === 'true') {
      setMetisActivated(true);
      setMetisVisible(true);
    } else {
      // Ensure Metis is not visible if not activated
      setMetisVisible(false);
    }
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
    };
  }, []);

  const hideMetis = () => {
    setMetisVisible(false);
    setMetisActivated(false);
    localStorage.setItem('metisActive', 'false');
    console.log("Metis iQube closed");
  };

  // Add a function to activate Metis
  const activateMetis = () => {
    setMetisActivated(true);
    setMetisVisible(true);
    localStorage.setItem('metisActive', 'true');
    
    // Dispatch the metisActivated event
    const activationEvent = new Event('metisActivated');
    window.dispatchEvent(activationEvent);
    
    console.log("Metis activated manually");
  };

  return {
    metisActivated,
    metisVisible,
    hideMetis,
    activateMetis
  };
}
