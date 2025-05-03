
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useDriveConnection } from '@/hooks/useDriveConnection';

export const useConnectionState = () => {
  const { checkApiStatus } = useMCP();
  
  // Extract only the properties we actually need from useDriveConnection with fallback values
  const {
    connectionInProgress = false,
    connectionAttempts = 0,
    connectToDrive,
    resetConnection
  } = useDriveConnection() || {};
  
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
  // Use connectToDrive to handle connection with better error handling
  const handleConnectClick = useCallback(async (): Promise<boolean> => {
    if (!connectToDrive) {
      console.error('connectToDrive function is not available');
      toast.error('Drive connection is not available', { 
        description: 'Please refresh the page and try again',
        id: 'missing-connect-function'
      });
      return false;
    }
    
    setConnecting(true);
    setConnectionError(false);
    try {
      console.log('DocumentSelector: Initiating connection process');
      // Use clientId and apiKey from the hook if available, otherwise use empty strings
      const clientId = localStorage.getItem('gdrive-client-id') || '';
      const apiKey = localStorage.getItem('gdrive-api-key') || '';
      
      console.log('useConnectionState: Connecting with stored credentials', {
        hasClientId: !!clientId,
        hasApiKey: !!apiKey
      });
      
      const result = await connectToDrive(clientId, apiKey);
      console.log('Connection result:', result);
      
      if (!result) {
        setConnectionError(true);
        toast.error('Failed to connect to Google Drive', {
          description: 'Please check your credentials and try again',
          id: 'connection-failed'
        });
      } else {
        toast.success('Connected to Google Drive successfully', {
          id: 'connection-success'
        });
      }
      return result;
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(true);
      toast.error('Connection error occurred', {
        description: error instanceof Error ? error.message : 'Unknown error',
        id: 'connection-error'
      });
      return false;
    } finally {
      setConnecting(false);
    }
  }, [connectToDrive]);
  
  // Handle reset connection with consistent UI feedback
  const handleResetConnection = useCallback(() => {
    if (!resetConnection) {
      console.error('resetConnection function is not available');
      toast.error('Reset connection function is not available', {
        description: 'Please refresh the page and try again',
        id: 'missing-reset-function'
      });
      return;
    }
    
    // Reset the connection
    resetConnection();
    setConnectionError(false);
    toast.success('Connection reset successfully', {
      description: 'You can now reconnect with new credentials',
      id: 'connection-reset'
    });
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
