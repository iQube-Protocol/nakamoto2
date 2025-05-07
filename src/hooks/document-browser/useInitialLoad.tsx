
import { useState, useEffect } from 'react';

/**
 * Hook to manage initial document loading state
 */
export function useInitialLoad(isOpen: boolean, driveConnected: boolean, refreshCallback: () => void) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Fetch documents when dialog opens or folder changes
  useEffect(() => {
    if (isOpen && driveConnected) {
      refreshCallback();
      // After first load, set initial load to false
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [isOpen, driveConnected, refreshCallback, isInitialLoad]);
  
  return {
    isInitialLoad
  };
}
