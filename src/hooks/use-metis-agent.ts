
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
    
    const metisActiveStatus = localStorage.getItem('metisActive');
    if (metisActiveStatus === 'true') {
      setMetisActivated(true);
      setMetisVisible(true);
    }
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
    };
  }, []);

  const hideMetis = () => {
    setMetisVisible(false);
    console.log("Metis iQube closed");
  };

  return {
    metisActivated,
    metisVisible,
    hideMetis
  };
}
