
import { useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Hook for checking API and connection status
 */
export function useStatusCheck(client: MCPClient | null, driveConnected: boolean) {
  // Get the current connection status from the client
  const getConnectionStatus = useCallback((): 'disconnected' | 'connecting' | 'connected' | 'error' => {
    if (!client) return 'disconnected';
    
    // Check if the DriveOperations class has a status getter method
    if (typeof client.getConnectionStatus === 'function') {
      return client.getConnectionStatus();
    }
    
    // Default to the driveConnected state if method is not available
    return driveConnected ? 'connected' : 'disconnected';
  }, [client, driveConnected]);
  
  // Check API status
  const checkApiStatus = useCallback((): boolean => {
    if (!client) return false;
    
    // Check if Google API is loaded successfully
    const isLoaded = client.isApiLoaded?.();
    console.log('MCP API loaded status:', isLoaded);
    
    return !!isLoaded;
  }, [client]);
  
  return {
    getConnectionStatus,
    checkApiStatus
  };
}
