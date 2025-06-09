
import { useState, useEffect, useCallback } from 'react';

interface QryptoPersonaState {
  qryptoPersonaActivated: boolean;
  activateQryptoPersona: () => void;
  deactivateQryptoPersona: () => void;
  toggleQryptoPersona: () => void;
}

const STORAGE_KEY = 'qrypto-persona-activated';

export const useQryptoPersona = (): QryptoPersonaState => {
  // Initialize from localStorage, defaulting to true
  const [qryptoPersonaActivated, setQryptoPersonaActivated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      console.error('Error reading Qrypto Persona state from localStorage:', error);
      return true;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(qryptoPersonaActivated));
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
