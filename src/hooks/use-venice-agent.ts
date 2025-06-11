
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
    setVeniceActivated(true);
    setVeniceVisible(true);
    localStorage.setItem(VENICE_STORAGE_KEY, 'true');
  };

  const deactivateVenice = () => {
    setVeniceActivated(false);
    setVeniceVisible(false);
    localStorage.setItem(VENICE_STORAGE_KEY, 'false');
  };

  const hideVenice = () => {
    setVeniceVisible(false);
    setVeniceActivated(false);
    localStorage.setItem(VENICE_STORAGE_KEY, 'false');
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === VENICE_STORAGE_KEY) {
        const newValue = e.newValue === 'true';
        setVeniceActivated(newValue);
        setVeniceVisible(newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    veniceActivated,
    veniceVisible,
    activateVenice,
    deactivateVenice,
    hideVenice
  };
};
