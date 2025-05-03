
import { useState, useEffect } from 'react';
import { useMCP } from './use-mcp';
import { useConnectionManager } from './useConnectionManager';
import { useConnectionReset } from './useConnectionReset';
import { useConnectionSync } from './useConnectionSync';
import { loadCredentials } from './utils/connectionUtils';
import { DriveConnectionHook } from './types/driveConnectionTypes';

export function useDriveConnection(): DriveConnectionHook {
  const { 
    driveConnected, 
    connectToDrive: mcpConnectToDrive, 
    isLoading, 
    client, 
    isApiLoading, 
    resetDriveConnection: mcpResetConnection,
    getConnectionStatus 
  } = useMCP();
  
  // Load saved credentials
  const { clientId: savedClientId, apiKey: savedApiKey } = loadCredentials();
  
  // Connection manager
  const connectionManager = useConnectionManager(mcpConnectToDrive);
  const {
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    connectionInProgress,
    connectionAttempts,
    connectionStatus,
    setConnectionStatus,
    lastConnectionResult,
    setConnectionInProgress,
    handleConnect
  } = connectionManager;
  
  // Connection reset
  const { resetConnection } = useConnectionReset(connectionManager, client, mcpResetConnection);
  
  // Try to load saved credentials from localStorage
  useEffect(() => {
    if (savedClientId) setClientId(savedClientId);
    if (savedApiKey) setApiKey(savedApiKey);
    
    if (client?.isConnectedToDrive()) {
      console.log('Drive is already connected based on client state');
    }
  }, [client, savedClientId, savedApiKey, setClientId, setApiKey]);
  
  // Sync connection status
  useConnectionSync({
    client,
    driveConnected,
    getConnectionStatus,
    connectionStatus,
    setConnectionStatus,
    setConnectionInProgress,
    lastConnectionResult,
    handleConnect
  });
  
  // Check API status periodically if errors occur
  useEffect(() => {
    // Only set up monitoring if we've seen API errors
    if (connectionManager.apiErrorCount > 0 && client) {
      const interval = setInterval(() => {
        // Check if API is now available
        if (client.isApiLoaded?.()) {
          console.log('API is now available after previous errors');
          connectionManager.setApiErrorCount(0);
          clearInterval(interval);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [connectionManager.apiErrorCount, client]);
  
  return {
    driveConnected,
    isLoading,
    isApiLoading,
    connectionInProgress,
    connectionAttempts,
    connectionStatus,
    clientId,
    apiKey,
    setClientId,
    setApiKey,
    connectToDrive: async (clientId: string, apiKey: string): Promise<boolean> => {
      console.log("Drive connection: Connecting with credentials", { 
        clientIdLength: clientId?.length, 
        apiKeyLength: apiKey ? '[PROVIDED]' : '[MISSING]'
      });
      return mcpConnectToDrive(clientId, apiKey);
    },
    resetConnection,
    
    // These are included to satisfy the TypeScript interface but not used directly
    connectionTimeout: connectionManager.connectionTimeout,
    apiErrorCount: connectionManager.apiErrorCount,
    lastConnectionResult: connectionManager.lastConnectionResult
  };
}
