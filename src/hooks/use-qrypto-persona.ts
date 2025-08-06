
import { useState, useEffect, useCallback, useRef } from 'react';
import NavigationGuard from '@/utils/NavigationGuard';

interface QryptoPersonaState {
  qryptoPersonaActivated: boolean;
  activateQryptoPersona: () => void;
  deactivateQryptoPersona: () => void;
  toggleQryptoPersona: () => void;
}

const STORAGE_KEY = 'qrypto-persona-activated';

export const useQryptoPersona = (): QryptoPersonaState => {
  const mountedRef = useRef(true);
  
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

  // Initialize NavigationGuard once
  useEffect(() => {
    NavigationGuard.init();
  }, []);

  // Save to localStorage whenever state changes (with navigation safety)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!mountedRef.current) return;

      NavigationGuard.preventDuringNavigation(() => {
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
      });
    }, 150);

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

  // Listen for activation and deactivation events from modal (with navigation protection)
  useEffect(() => {
    const handleQryptoActivation = () => {
      if (!NavigationGuard.isNavigationInProgress() && mountedRef.current) {
        setQryptoPersonaActivated(true);
      }
    };

    const handleQryptoDeactivation = () => {
      if (!NavigationGuard.isNavigationInProgress() && mountedRef.current) {
        setQryptoPersonaActivated(false);
      }
    };

    window.addEventListener('qryptoPersonaActivated', handleQryptoActivation);
    window.addEventListener('qryptoPersonaDeactivated', handleQryptoDeactivation);
    
    return () => {
      window.removeEventListener('qryptoPersonaActivated', handleQryptoActivation);
      window.removeEventListener('qryptoPersonaDeactivated', handleQryptoDeactivation);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    qryptoPersonaActivated,
    activateQryptoPersona,
    deactivateQryptoPersona,
    toggleQryptoPersona
  };
};
