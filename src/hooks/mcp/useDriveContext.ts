
import { useState, useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { toast } from 'sonner';

/**
 * Hook for handling Google Drive connection functionality
 */
export function useDriveContext(client: MCPClient | null) {
  const [driveConnected, setDriveConnected] = useState<boolean>(
    localStorage.getItem('gdrive-connected') === 'true'
  );
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Reset Google Drive connection
  const resetDriveConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!client) {
        throw new Error('MCP client not initialized');
      }
      
      // Reset Google Drive connection in the client
      await client.resetDriveConnection();
      
      // Update local state
      setDriveConnected(false);
      localStorage.removeItem('gdrive-connected');
      
      return true;
    } catch (error) {
      console.error('Error resetting Drive connection:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  return {
    driveConnected,
    isLoading,
    connectToDrive,
    resetDriveConnection
  };
}
