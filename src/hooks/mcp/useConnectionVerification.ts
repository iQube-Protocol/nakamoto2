
import { useState, useEffect } from 'react';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Hook to verify and maintain connection state
 */
export function useConnectionVerification(
  client: MCPClient | null,
  driveConnected: boolean,
  setDriveConnected: (state: boolean) => void,
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void
) {
  // Setup periodic connection verification
  useEffect(() => {
    if (client && driveConnected) {
      const interval = setInterval(() => {
        // Verify the connection is still valid by checking local storage and API state
        const storedConnectionState = localStorage.getItem('gdrive-connected') === 'true';
        const apiLoaded = client.isApiLoaded?.();
        const clientConnected = client.isConnectedToDrive?.();
        
        const isActuallyConnected = storedConnectionState && apiLoaded && clientConnected;
        
        if (driveConnected !== isActuallyConnected) {
          console.log(`useConnectionVerification: Connection state mismatch detected. Updating from ${driveConnected} to ${isActuallyConnected}`);
          setDriveConnected(isActuallyConnected);
          setConnectionStatus(isActuallyConnected ? 'connected' : 'disconnected');
          localStorage.setItem('gdrive-connected', isActuallyConnected ? 'true' : 'false');
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [client, driveConnected, setDriveConnected, setConnectionStatus]);
  
  // Update state based on localStorage changes (in case of multi-tab operation)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gdrive-connected') {
        const newConnected = e.newValue === 'true';
        if (driveConnected !== newConnected) {
          console.log('useConnectionVerification: Connection state changed via localStorage:', newConnected);
          setDriveConnected(newConnected);
          setConnectionStatus(newConnected ? 'connected' : 'disconnected');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [driveConnected, setDriveConnected, setConnectionStatus]);
}
