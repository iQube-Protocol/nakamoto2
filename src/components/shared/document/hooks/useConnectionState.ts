
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useDriveConnection } from '@/hooks/useDriveConnection';

export const useConnectionState = () => {
  const { checkApiStatus } = useMCP();
  
  // Extract only the properties we actually need from useDriveConnection
  const {
    connectionInProgress,
    connectionAttempts,
    connectToDrive, // Use this function directly instead of accessing handleConnect
    resetConnection
  } = useDriveConnection();
  
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
  // Use connectToDrive instead of handleConnect
  const handleConnectClick = useCallback(async (): Promise<boolean> => {
    setConnecting(true);
    setConnectionError(false);
    try {
      console.log('DocumentSelector: Initiating connection process');
      // Use clientId and apiKey from the hook if available, otherwise use empty strings
      const clientId = localStorage.getItem('gdrive-client-id') || '';
      const apiKey = localStorage.getItem('gdrive-api-key') || '';
      const result = await connectToDrive(clientId, apiKey);
      if (!result) {
        setConnectionError(true);
      }
      return result;
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(true);
      return false;
    } finally {
      setConnecting(false);
    }
  }, [connectToDrive]);
  
  // Handle reset connection with consistent UI feedback
  const handleResetConnection = useCallback(() => {
    // Reset the connection
    resetConnection();
    setConnectionError(false);
  }, [resetConnection]);

  return {
    connecting,
    connectionError,
    setConnectionError,
    refreshAttempts,
    setRefreshAttempts,
    checkApiStatus,
    connectionInProgress,
    connectionAttempts,
    handleConnectClick,
    handleResetConnection
  };
};
