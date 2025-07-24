
import { useState, useEffect, useCallback } from 'react';

interface QryptoPersonaState {
  qryptoPersonaActivated: boolean;
  activateQryptoPersona: () => void;
  deactivateQryptoPersona: () => void;
  toggleQryptoPersona: () => void;
}

const STORAGE_KEY = 'qrypto-persona-activated';

export const useQryptoPersona = (): QryptoPersonaState => {
  // Initialize from localStorage, defaulting to false (inactive)
  const [qryptoPersonaActivated, setQryptoPersonaActivated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error reading Qrypto Persona state from localStorage:', error);
      return false;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(qryptoPersonaActivated));
      
      // Dispatch events for persona context updates
      if (qryptoPersonaActivated) {
        window.dispatchEvent(new CustomEvent('qryptoPersonaActivated'));
      } else {
        window.dispatchEvent(new CustomEvent('qryptoPersonaDeactivated'));
      }
    } catch (error) {
      console.error('Error saving Qrypto Persona state to localStorage:', error);
    }
  }, [qryptoPersonaActivated]);

  const activateQryptoPersona = useCallback(() => {
    setQryptoPersonaActivated(true);
  }, []);

  const deactivateQryptoPersona = useCallback(() => {
    setQryptoPersonaActivated(false);
  }, []);

  const toggleQryptoPersona = useCallback(() => {
    setQryptoPersonaActivated(prev => !prev);
  }, []);

  return {
    qryptoPersonaActivated,
    activateQryptoPersona,
    deactivateQryptoPersona,
    toggleQryptoPersona
  };
};
