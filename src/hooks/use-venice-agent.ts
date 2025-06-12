
import { useState, useEffect } from 'react';

const VENICE_STORAGE_KEY = 'venice_activated';

export const useVeniceAgent = () => {
  const [veniceActivated, setVeniceActivated] = useState(() => {
    const stored = localStorage.getItem(VENICE_STORAGE_KEY);
    return stored === 'true';
  });

  const [veniceVisible, setVeniceVisible] = useState(() => {
    const stored = localStorage.getItem(VENICE_STORAGE_KEY);
    return stored === 'true';
  });

  const activateVenice = () => {
    console.log('Venice: Activating Venice agent');
    setVeniceActivated(true);
    setVeniceVisible(true);
    localStorage.setItem(VENICE_STORAGE_KEY, 'true');
  };

  const deactivateVenice = () => {
    console.log('Venice: Deactivating Venice agent');
    setVeniceActivated(false);
    setVeniceVisible(false);
    localStorage.setItem(VENICE_STORAGE_KEY, 'false');
  };

  const hideVenice = () => {
    console.log('Venice: Hiding Venice agent');
    setVeniceVisible(false);
    setVeniceActivated(false);
    localStorage.setItem(VENICE_STORAGE_KEY, 'false');
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
    console.log('Venice: State updated - activated:', veniceActivated, 'visible:', veniceVisible);
  }, [veniceActivated, veniceVisible]);

  return {
    veniceActivated,
    veniceVisible,
    activateVenice,
    deactivateVenice,
    hideVenice
  };
};
