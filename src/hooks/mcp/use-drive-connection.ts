
import { useState } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { useApiStateTracking } from './useApiStateTracking';
import { useConnectionInitialization } from './useConnectionInitialization';
import { useConnectionVerification } from './useConnectionVerification';
import { useConnectionOperations } from './useConnectionOperations';
import { useStatusCheck } from './useStatusCheck';

/**
 * Hook to manage Google Drive connection state
 */
export function useDriveConnection() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // Use the Api state tracking hook
  const { isApiLoading, apiLoadError } = useApiStateTracking(client);
  
  // Initialize the connection
  useConnectionInitialization(
    setClient,
    setIsInitialized,
    setDriveConnected,
    setConnectionStatus,
    setIsLoading
  );
  
  // Set up connection verification
  useConnectionVerification(
    client,
    driveConnected,
    setDriveConnected,
    setConnectionStatus
  );
  
  // Get connection operations
  const { connectToDrive, resetDriveConnection } = useConnectionOperations(
    client,
    setDriveConnected,
    setIsLoading,
    setConnectionStatus
  );
  
  // Get status checking functions
  const { getConnectionStatus, checkApiStatus } = useStatusCheck(client, driveConnected);

  return {
    client,
    isInitialized,
    driveConnected,
    isLoading,
    isApiLoading,
    apiLoadError,
    connectionStatus,
    getConnectionStatus,
    connectToDrive,
    resetDriveConnection,
    checkApiStatus
  };
}
