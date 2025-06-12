
import { useState, useEffect } from 'react';

const VENICE_STORAGE_KEY = 'venice_activated';

export const useVeniceAgent = () => {
  const [veniceActivated, setVeniceActivated] = useState(() => {
    const stored = localStorage.getItem(VENICE_STORAGE_KEY);
    console.log('Venice: Initial state from localStorage:', stored);
    return stored === 'true';
  });

  const [veniceVisible, setVeniceVisible] = useState(() => {
    const stored = localStorage.getItem(VENICE_STORAGE_KEY);
    return stored === 'true';
  });

  const activateVenice = () => {
    console.log('Venice: ACTIVATING Venice agent');
    setVeniceActivated(true);
    setVeniceVisible(true);
    localStorage.setItem(VENICE_STORAGE_KEY, 'true');
    // Trigger a custom event to notify all components
    window.dispatchEvent(new CustomEvent('veniceStateChanged', { detail: { activated: true } }));
  };

  const deactivateVenice = () => {
    console.log('Venice: DEACTIVATING Venice agent');
    setVeniceActivated(false);
    setVeniceVisible(false);
    localStorage.setItem(VENICE_STORAGE_KEY, 'false');
    // Trigger a custom event to notify all components
    window.dispatchEvent(new CustomEvent('veniceStateChanged', { detail: { activated: false } }));
  };

  const hideVenice = () => {
    console.log('Venice: HIDING Venice agent');
    setVeniceVisible(false);
    setVeniceActivated(false);
    localStorage.setItem(VENICE_STORAGE_KEY, 'false');
    // Trigger a custom event to notify all components
    window.dispatchEvent(new CustomEvent('veniceStateChanged', { detail: { activated: false } }));
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === VENICE_STORAGE_KEY) {
        const newValue = e.newValue === 'true';
        console.log('Venice: Storage change detected, new value:', newValue);
        setVeniceActivated(newValue);
        setVeniceVisible(newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('Venice: STATE UPDATED - activated:', veniceActivated, 'visible:', veniceVisible);
  }, [veniceActivated, veniceVisible]);

  return {
    veniceActivated,
    veniceVisible,
    activateVenice,
    deactivateVenice,
    hideVenice
  };
};
