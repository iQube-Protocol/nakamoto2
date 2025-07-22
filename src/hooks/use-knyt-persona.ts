
import { useState, useEffect } from 'react';

const KNYT_STORAGE_KEY = 'knyt-persona-activated';

export const useKNYTPersona = () => {
  const [knytPersonaActivated, setKnytPersonaActivated] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(KNYT_STORAGE_KEY);
    console.log('🟪 KNYT Persona Hook: Initial state from localStorage:', stored);
    return stored === 'true';
  });

  const activateKNYTPersona = () => {
    console.log('🟢 KNYT Persona: Activating');
    setKnytPersonaActivated(true);
    localStorage.setItem(KNYT_STORAGE_KEY, 'true');
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('knytPersonaActivated'));
  };

  const deactivateKNYTPersona = () => {
    console.log('🔴 KNYT Persona: Deactivating');
    setKnytPersonaActivated(false);
    localStorage.setItem(KNYT_STORAGE_KEY, 'false');
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('knytPersonaDeactivated'));
  };

  // Listen for storage changes and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === KNYT_STORAGE_KEY) {
        const newValue = e.newValue === 'true';
        console.log('💾 KNYT Persona: Storage change detected, new value:', newValue);
        setKnytPersonaActivated(newValue);
      }
    };

    const handleCustomEvent = () => {
      const stored = localStorage.getItem(KNYT_STORAGE_KEY);
      const isActivated = stored === 'true';
      console.log('📡 KNYT Persona: Custom event received, localStorage value:', stored);
      setKnytPersonaActivated(isActivated);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('knytPersonaActivated', handleCustomEvent);
    window.addEventListener('knytPersonaDeactivated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('knytPersonaActivated', handleCustomEvent);
      window.removeEventListener('knytPersonaDeactivated', handleCustomEvent);
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🎯 KNYT Persona: State updated - activated:', knytPersonaActivated);
  }, [knytPersonaActivated]);

  return {
    knytPersonaActivated,
    activateKNYTPersona,
    deactivateKNYTPersona
  };
};
