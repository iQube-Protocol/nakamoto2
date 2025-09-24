
import { useState, useEffect, useCallback, useRef } from 'react';
import NavigationGuard from '@/utils/NavigationGuard';

interface QriptoPersonaState {
  qriptoPersonaActivated: boolean;
  activateQriptoPersona: () => void;
  deactivateQriptoPersona: () => void;
  toggleQriptoPersona: () => void;
}

const STORAGE_KEY = 'qripto-persona-activated';

export const useQriptoPersona = (): QriptoPersonaState => {
  const mountedRef = useRef(true);
  
  // Initialize from localStorage, defaulting to false (inactive)
  const [qriptoPersonaActivated, setQriptoPersonaActivated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error reading Qripto Persona state from localStorage:', error);
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify(qriptoPersonaActivated));
          
          // Dispatch events for persona context updates
          if (qriptoPersonaActivated) {
            window.dispatchEvent(new CustomEvent('qriptoPersonaActivated'));
          } else {
            window.dispatchEvent(new CustomEvent('qriptoPersonaDeactivated'));
          }
        } catch (error) {
          console.error('Error saving Qripto Persona state to localStorage:', error);
        }
      });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [qriptoPersonaActivated]);

  const activateQriptoPersona = useCallback(() => {
    setQriptoPersonaActivated(true);
  }, []);

  const deactivateQriptoPersona = useCallback(() => {
    setQriptoPersonaActivated(false);
  }, []);

  const toggleQriptoPersona = useCallback(() => {
    setQriptoPersonaActivated(prev => !prev);
  }, []);

  // Listen for activation and deactivation events from modal (with navigation protection)
  useEffect(() => {
    const handleQriptoActivation = () => {
      if (!NavigationGuard.isNavigationInProgress() && mountedRef.current) {
        setQriptoPersonaActivated(true);
      }
    };

    const handleQriptoDeactivation = () => {
      if (!NavigationGuard.isNavigationInProgress() && mountedRef.current) {
        setQriptoPersonaActivated(false);
      }
    };

    window.addEventListener('qriptoPersonaActivated', handleQriptoActivation);
    window.addEventListener('qriptoPersonaDeactivated', handleQriptoDeactivation);
    
    return () => {
      window.removeEventListener('qriptoPersonaActivated', handleQriptoActivation);
      window.removeEventListener('qriptoPersonaDeactivated', handleQriptoDeactivation);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    qriptoPersonaActivated,
    activateQriptoPersona,
    deactivateQriptoPersona,
    toggleQriptoPersona
  };
};
