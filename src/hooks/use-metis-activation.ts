
import { useState, useEffect } from 'react';

export const useMetisActivation = () => {
  const [metisActive, setMetisActive] = useState<boolean>(false);

  // Listen for Metis activation events
  useEffect(() => {
    // Check if Metis is already activated via localStorage
    const storedMetisActive = localStorage.getItem('metisActive');
    if (storedMetisActive === 'true') {
      setMetisActive(true);
      console.log('Metis already active from localStorage');
    }

    const handleMetisActivated = () => {
      setMetisActive(true);
      console.log('Metis agent activated via custom event');
    };

    window.addEventListener('metisActivated', handleMetisActivated);
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
    };
  }, []);
  
  // Function to update Metis status
  const updateMetisStatus = (status: boolean) => {
    setMetisActive(status);
    
    // Persist Metis activation status to localStorage
    localStorage.setItem('metisActive', status.toString());
    
    // Dispatch global event to notify other components
    if (status) {
      const activationEvent = new Event('metisActivated');
      window.dispatchEvent(activationEvent);
    }
    
    console.log(`Metis agent status updated to: ${status}`);
  };

  return { metisActive, updateMetisStatus };
};
