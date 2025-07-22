
import { useState, useEffect } from 'react';

const QRYPTO_STORAGE_KEY = 'qrypto-persona-activated';

export const useQryptoPersona = () => {
  const [qryptoPersonaActivated, setQryptoPersonaActivated] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(QRYPTO_STORAGE_KEY);
    console.log('🔷 Qrypto Persona Hook: Initial state from localStorage:', stored);
    return stored === 'true';
  });

  const activateQryptoPersona = () => {
    console.log('🟢 Qrypto Persona: Activating');
    setQryptoPersonaActivated(true);
    localStorage.setItem(QRYPTO_STORAGE_KEY, 'true');
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('qryptoPersonaActivated'));
  };

  const deactivateQryptoPersona = () => {
    console.log('🔴 Qrypto Persona: Deactivating');
    setQryptoPersonaActivated(false);
    localStorage.setItem(QRYPTO_STORAGE_KEY, 'false');
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('qryptoPersonaDeactivated'));
  };

  // Listen for storage changes and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === QRYPTO_STORAGE_KEY) {
        const newValue = e.newValue === 'true';
        console.log('💾 Qrypto Persona: Storage change detected, new value:', newValue);
        setQryptoPersonaActivated(newValue);
      }
    };

    const handleCustomEvent = () => {
      const stored = localStorage.getItem(QRYPTO_STORAGE_KEY);
      const isActivated = stored === 'true';
      console.log('📡 Qrypto Persona: Custom event received, localStorage value:', stored);
      setQryptoPersonaActivated(isActivated);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('qryptoPersonaActivated', handleCustomEvent);
    window.addEventListener('qryptoPersonaDeactivated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('qryptoPersonaActivated', handleCustomEvent);
      window.removeEventListener('qryptoPersonaDeactivated', handleCustomEvent);
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🎯 Qrypto Persona: State updated - activated:', qryptoPersonaActivated);
  }, [qryptoPersonaActivated]);

  return {
    qryptoPersonaActivated,
    activateQryptoPersona,
    deactivateQryptoPersona
  };
};
