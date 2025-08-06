
import { useState, useEffect, useCallback, useRef } from 'react';

interface QryptoPersonaState {
  qryptoPersonaActivated: boolean;
  activateQryptoPersona: () => void;
  deactivateQryptoPersona: () => void;
  toggleQryptoPersona: () => void;
}

const STORAGE_KEY = 'qrypto-persona-activated';

// Navigation state tracking to prevent event cascades during route changes
let isNavigating = false;
let navigationTimeout: NodeJS.Timeout | null = null;

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

  // Track navigation state to prevent event cascades
  useEffect(() => {
    const handleNavigationStart = () => {
      isNavigating = true;
      if (navigationTimeout) clearTimeout(navigationTimeout);
      navigationTimeout = setTimeout(() => {
        isNavigating = false;
      }, 500); // 500ms navigation protection window
    };

    const handleRouteChange = () => {
      handleNavigationStart();
    };

    // Listen for navigation events
    window.addEventListener('beforeunload', handleNavigationStart);
    window.addEventListener('popstate', handleNavigationStart);
    
    // Listen for React Router navigation (if available)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      handleNavigationStart();
      return originalPushState.apply(this, args);
    };
    
    window.history.replaceState = function(...args) {
      handleNavigationStart();
      return originalReplaceState.apply(this, args);
    };

    return () => {
      window.removeEventListener('beforeunload', handleNavigationStart);
      window.removeEventListener('popstate', handleNavigationStart);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      if (navigationTimeout) clearTimeout(navigationTimeout);
    };
  }, []);

  // Save to localStorage whenever state changes (with navigation safety)
  useEffect(() => {
    // Enhanced debounce with navigation state checking
    const timeoutId = setTimeout(() => {
      // Skip localStorage operations and event dispatching during navigation
      if (isNavigating || !mountedRef.current) {
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(qryptoPersonaActivated));
        
        // Dispatch events for persona context updates (only when not navigating)
        if (qryptoPersonaActivated) {
          window.dispatchEvent(new CustomEvent('qryptoPersonaActivated'));
        } else {
          window.dispatchEvent(new CustomEvent('qryptoPersonaDeactivated'));
        }
      } catch (error) {
        console.error('Error saving Qrypto Persona state to localStorage:', error);
      }
    }, 150); // Increased debounce to 150ms for better navigation safety

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
      if (!isNavigating && mountedRef.current) {
        setQryptoPersonaActivated(true);
      }
    };

    const handleQryptoDeactivation = () => {
      if (!isNavigating && mountedRef.current) {
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
