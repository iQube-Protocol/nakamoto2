
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useDriveConnection } from '@/hooks/useDriveConnection';

export const useConnectionState = () => {
  const { checkApiStatus } = useMCP();
  
  const {
    connectionInProgress,
    connectionAttempts,
    handleConnect,
    resetConnection
  } = useDriveConnection();
  
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
  // Handle connection with better Promise handling
  const handleConnectClick = useCallback(async (): Promise<boolean> => {
    setConnecting(true);
    setConnectionError(false);
    try {
      console.log('DocumentSelector: Initiating connection process');
      const result = await handleConnect();
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
  }, [handleConnect]);
  
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
