
import { useState, useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { toast } from 'sonner';

/**
 * Hook for managing Google Drive connection
 */
export function useDriveConnection(client: MCPClient | null) {
  const [driveConnected, setDriveConnected] = useState<boolean>(
    localStorage.getItem('gdrive-connected') === 'true'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Connect to Google Drive
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    setIsLoading(true);
    try {
      // Validate that we have the required credentials
      if (!clientId || !apiKey) {
        toast.error('Missing Google API credentials', {
          description: 'Both Client ID and API Key are required'
        });
        return false;
      }
      
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey);
      
      if (success) {
        localStorage.setItem('gdrive-connected', 'true');
        setDriveConnected(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      toast.error('Failed to connect to Google Drive', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Reset Google Drive connection without page reload
  const resetDriveConnection = useCallback(async () => {
    try {
      // Clear connection cache first
      localStorage.removeItem('gdrive-connected');
      
      // Clear any Google API session tokens
      if (window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(undefined, () => {
          console.log('Google OAuth tokens revoked');
        });
      }
      
      // Clear GAPI auth
      if (window.gapi?.auth) {
        window.gapi.auth.setToken(null);
      }
      
      // Reset client's connection state
      if (client) {
        client.resetDriveConnection();
      }
      
      // Update local state
      setDriveConnected(false);
      
      return true;
    } catch (error) {
      console.error('Error during connection reset:', error);
      throw error;
    }
  }, [client]);

  return {
    driveConnected,
    isLoading,
    connectToDrive,
    resetDriveConnection
  };
}
