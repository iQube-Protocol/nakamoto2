
import { useState, useEffect, useCallback } from 'react';
import { walletConnectionService } from '@/services/wallet-connection-service';

interface KNYTPersonaState {
  knytPersonaActivated: boolean;
  knytPersonaVisible: boolean;
  activateKNYTPersona: () => void;
  deactivateKNYTPersona: () => void;
  toggleKNYTPersona: () => void;
  hideKNYTPersona: () => void;
}

const STORAGE_KEY = 'knyt-persona-activated';

export const useKNYTPersona = (): KNYTPersonaState => {
  // Initialize from localStorage, defaulting to false (inactive)
  const [knytPersonaActivated, setKNYTPersonaActivated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error reading KNYT Persona state from localStorage:', error);
      return false;
    }
  });

  const [knytPersonaVisible, setKNYTPersonaVisible] = useState<boolean>(true);

  // Save to localStorage whenever state changes (with navigation safety)
  useEffect(() => {
    // Debounce rapid state changes during navigation
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(knytPersonaActivated));
        
        // Dispatch events for persona context updates
        if (knytPersonaActivated) {
          window.dispatchEvent(new CustomEvent('knytPersonaActivated'));
          
          // Trigger KNYT balance refresh when persona is activated
          console.log('KNYT Persona activated, refreshing token balance...');
          walletConnectionService.refreshKnytBalance().catch(error => {
            console.error('Error refreshing KNYT balance on activation:', error);
          });
        } else {
          window.dispatchEvent(new CustomEvent('knytPersonaDeactivated'));
        }
      } catch (error) {
        console.error('Error saving KNYT Persona state to localStorage:', error);
      }
    }, 100); // 100ms debounce to prevent compilation cascades

    return () => clearTimeout(timeoutId);
  }, [knytPersonaActivated]);

  const activateKNYTPersona = useCallback(() => {
    setKNYTPersonaActivated(true);
  }, []);

  const deactivateKNYTPersona = useCallback(() => {
    setKNYTPersonaActivated(false);
  }, []);

  const toggleKNYTPersona = useCallback(() => {
    setKNYTPersonaActivated(prev => !prev);
  }, []);

  const hideKNYTPersona = useCallback(() => {
    setKNYTPersonaVisible(false);
  }, []);

  // Listen for external activation and deactivation events (from modal)
  useEffect(() => {
    const handleExternalActivation = () => {
      setKNYTPersonaActivated(true);
    };

    const handleExternalDeactivation = () => {
      setKNYTPersonaActivated(false);
    };

    window.addEventListener('knytPersonaActivated', handleExternalActivation);
    window.addEventListener('knytPersonaDeactivated', handleExternalDeactivation);
    
    return () => {
      window.removeEventListener('knytPersonaActivated', handleExternalActivation);
      window.removeEventListener('knytPersonaDeactivated', handleExternalDeactivation);
    };
  }, []);


  return {
    knytPersonaActivated,
    knytPersonaVisible,
    activateKNYTPersona,
    deactivateKNYTPersona,
    toggleKNYTPersona,
    hideKNYTPersona
  };
};
