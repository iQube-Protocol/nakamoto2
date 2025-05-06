
import { useEffect } from 'react';
import { MCPClient, getMCPClient } from '@/integrations/mcp/client';

/**
 * Hook to initialize MCP client and connection state
 */
export function useConnectionInitialization(
  setClient: (client: MCPClient | null) => void,
  setIsInitialized: (state: boolean) => void,
  setDriveConnected: (state: boolean) => void,
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void,
  setIsApiLoading: (state: boolean) => void
) {
  // Initialize MCP client
  useEffect(() => {
    // Check if we already have a connection to Google Drive
    const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
    console.log('useConnectionInitialization: Initial connection state from localStorage:', hasConnection);
    
    const mcpClient = getMCPClient({
      // Check for metisActive status from localStorage
      metisActive: localStorage.getItem('metisActive') === 'true',
      onApiLoadStart: () => {
        console.log('MCP API loading started');
        setIsApiLoading(true);
      },
      onApiLoadComplete: () => {
        console.log('MCP API loading completed');
        setIsApiLoading(false);
      }
    });
    
    setClient(mcpClient);
    setIsInitialized(true);
    setDriveConnected(hasConnection);
    setConnectionStatus(hasConnection ? 'connected' : 'disconnected');
  }, [setClient, setIsInitialized, setDriveConnected, setConnectionStatus, setIsApiLoading]);
}
