
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useDriveConnection } from '@/hooks/useDriveConnection';

export const useConnectionState = () => {
  const { 
    isApiLoading, 
    checkApiStatus 
  } = useMCP();
  
  const {
    connectionInProgress,
    connectionAttempts,
    handleConnect,
    resetConnection
  } = useDriveConnection();
  
  const [connecting, setConnecting] = useState(false);
  const [apiLoadingState, setApiLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [apiCheckAttempts, setApiCheckAttempts] = useState(0);
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
    // First reset API loading state
    setApiLoadingState('loading');
    setApiCheckAttempts(0);
    setConnectionError(false);
    
    // Then reset the connection
    resetConnection();
  }, [resetConnection]);

  return {
    connecting,
    apiLoadingState,
    setApiLoadingState,
    apiCheckAttempts,
    setApiCheckAttempts,
    connectionError,
    setConnectionError,
    refreshAttempts,
    setRefreshAttempts,
    isApiLoading,
    checkApiStatus,
    connectionInProgress,
    connectionAttempts,
    handleConnectClick,
    handleResetConnection
  };
};
