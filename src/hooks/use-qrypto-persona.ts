
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

  // Save to localStorage whenever state changes (with navigation safety)
  useEffect(() => {
    // Debounce rapid state changes during navigation
    const timeoutId = setTimeout(() => {
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
    }, 100); // 100ms debounce to prevent compilation cascades

    return () => clearTimeout(timeoutId);
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

  // Listen for activation and deactivation events from modal
  useEffect(() => {
    const handleQryptoActivation = () => {
      setQryptoPersonaActivated(true);
    };

    const handleQryptoDeactivation = () => {
      setQryptoPersonaActivated(false);
    };

    window.addEventListener('qryptoPersonaActivated', handleQryptoActivation);
    window.addEventListener('qryptoPersonaDeactivated', handleQryptoDeactivation);
    
    return () => {
      window.removeEventListener('qryptoPersonaActivated', handleQryptoActivation);
      window.removeEventListener('qryptoPersonaDeactivated', handleQryptoDeactivation);
    };
  }, []);

  return {
    qryptoPersonaActivated,
    activateQryptoPersona,
    deactivateQryptoPersona,
    toggleQryptoPersona
  };
};
