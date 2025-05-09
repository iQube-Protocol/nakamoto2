
import { useState, useEffect } from 'react';

export function useMetisAgent() {
  const [metisActivated, setMetisActivated] = useState(false);
  const [metisVisible, setMetisVisible] = useState(false);

  useEffect(() => {
    const handleMetisActivated = () => {
      console.log('Metis agent activation detected');
      setMetisActivated(true);
      setMetisVisible(true);
      
      // Update localStorage to remember the Metis state
      localStorage.setItem('metisActive', 'true');
    };

    window.addEventListener('metisActivated', handleMetisActivated);
    
    // Check localStorage only after component mounts
    const metisActiveStatus = localStorage.getItem('metisActive');
    if (metisActiveStatus === 'true') {
      setMetisActivated(true);
      setMetisVisible(true);
      console.log('Metis agent activated from localStorage');
    } else {
      // Ensure Metis is not visible if not activated
      setMetisVisible(false);
      console.log('Metis agent not active in localStorage');
    }
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
    };
  }, []);

  const hideMetis = () => {
    setMetisVisible(false);
    setMetisActivated(false);
    localStorage.setItem('metisActive', 'false');
    console.log("Metis closed");
    
    // Dispatch an event to notify other components that Metis was deactivated
    const deactivationEvent = new Event('metisDeactivated');
    window.dispatchEvent(deactivationEvent);
  };

  // Function to activate Metis
  const activateMetis = () => {
    setMetisActivated(true);
    setMetisVisible(true);
    localStorage.setItem('metisActive', 'true');
    
    // Dispatch the metisActivated event
    const activationEvent = new Event('metisActivated');
    window.dispatchEvent(activationEvent);
    
    console.log("Metis activated");
  };

  return {
    metisActivated,
    metisVisible,
    hideMetis,
    activateMetis
  };
}
