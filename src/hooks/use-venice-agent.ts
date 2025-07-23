
import { useState, useEffect } from 'react';

const VENICE_STORAGE_KEY = 'venice_activated';

export const useVeniceAgent = () => {
  const [veniceActivated, setVeniceActivated] = useState(() => {
    const stored = localStorage.getItem(VENICE_STORAGE_KEY);
    console.log('🏗️ Venice Hook: Initial state from localStorage:', stored);
    return stored === 'true';
  });

  const [veniceVisible, setVeniceVisible] = useState(() => {
    const stored = localStorage.getItem(VENICE_STORAGE_KEY);
    return stored === 'true';
  });

  const activateVenice = () => {
    console.log('🟢 Venice: Activating Venice agent');
    setVeniceActivated(true);
    setVeniceVisible(true);
    localStorage.setItem(VENICE_STORAGE_KEY, 'true');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('veniceStateChanged', { 
      detail: { activated: true, visible: true } 
    }));
  };

  const deactivateVenice = () => {
    console.log('🔴 Venice: Deactivating Venice agent');
    setVeniceActivated(false);
    setVeniceVisible(false);
    localStorage.setItem(VENICE_STORAGE_KEY, 'false');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('veniceStateChanged', { 
      detail: { activated: false, visible: false } 
    }));
  };

  const hideVenice = () => {
    console.log('👁️ Venice: Hiding Venice agent');
    setVeniceVisible(false);
    setVeniceActivated(false);
    localStorage.setItem(VENICE_STORAGE_KEY, 'false');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('veniceStateChanged', { 
      detail: { activated: false, visible: false } 
    }));
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === VENICE_STORAGE_KEY) {
        const newValue = e.newValue === 'true';
        console.log('💾 Venice: Storage change detected, new value:', newValue);
        setVeniceActivated(newValue);
        setVeniceVisible(newValue);
      }
    };

    // Listen for custom Venice state changes
    const handleVeniceStateChange = (e: CustomEvent) => {
      console.log('📡 Venice: Custom event received:', e.detail);
      setVeniceActivated(e.detail.activated);
      setVeniceVisible(e.detail.visible);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('veniceStateChanged', handleVeniceStateChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('veniceStateChanged', handleVeniceStateChange as EventListener);
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🎯 Venice: State updated - activated:', veniceActivated, 'visible:', veniceVisible);
  }, [veniceActivated, veniceVisible]);

  return {
    veniceActivated,
    veniceVisible,
    activateVenice,
    deactivateVenice,
    hideVenice
  };
};
