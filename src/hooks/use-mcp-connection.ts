
import { useState, useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp';
import { toast } from 'sonner';

/**
 * Hook for managing MCP client connection state
 */
export function useMCPConnection() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  
  // Initialize MCP client with connection status
  const initializeClient = useCallback((mcpClient: MCPClient, hasConnection: boolean) => {
    setClient(mcpClient);
    setIsInitialized(true);
    setDriveConnected(hasConnection);
  }, []);
  
  // Update API loading state
  const updateApiLoadingState = useCallback((isLoading: boolean) => {
    setIsApiLoading(isLoading);
  }, []);
  
  // Update connection status
  const updateConnectionStatus = useCallback((connected: boolean) => {
    setDriveConnected(connected);
  }, []);
  
  // Connect to Google Drive with optimized flow
  const connectToDrive = useCallback(async (client: MCPClient | null, clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    try {
      console.log('MCP: Starting Drive connection with', { clientId, apiKeyProvided: !!apiKey });
      
      // Validate that we have the required credentials
      if (!clientId || !apiKey) {
        toast.error('Missing Google API credentials');
        return false;
      }
      
      // Use cached token if available
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      console.log('MCP: Cached token available:', !!cachedToken);
      
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey, cachedToken);
      console.log('MCP: Connection result:', success);
      
      if (success) {
        localStorage.setItem('gdrive-connected', 'true');
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
    }
  }, []);
  
  // Reset connection state
  const resetConnection = useCallback((client: MCPClient | null) => {
    if (!client) return;
    
    console.log('MCP: Resetting Drive connection');
    client.resetConnection();
    
    toast.success('Connection reset', {
      description: 'Google Drive connection has been reset'
    });
  }, []);
  
  return {
    client,
    isInitialized,
    driveConnected,
    isApiLoading,
    initializeClient,
    updateApiLoadingState,
    updateConnectionStatus,
    connectToDrive,
    resetConnection
  };
}
