
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

/**
 * Hook for managing Google Drive connection and credentials
 */
export function useDriveConnection() {
  const { driveConnected, connectToDrive, isLoading, client, resetConnection: resetMcpConnection } = useMCP();
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState(0);
  
  // Load saved credentials from localStorage
  useEffect(() => {
    const savedClientId = localStorage.getItem('gdrive-client-id');
    const savedApiKey = localStorage.getItem('gdrive-api-key');
    
    if (savedClientId) setClientId(savedClientId);
    if (savedApiKey) setApiKey(savedApiKey);
    
    if (client?.isConnectedToDrive()) {
      console.log('Drive is already connected based on client state');
    }
  }, [client]);
  
  // Handle connection with throttling and better state management
  const handleConnect = useCallback(async () => {
    if (!clientId || !apiKey) {
      toast.error('Missing Google API credentials', {
        description: 'Both Client ID and API Key are required'
      });
      return false;
    }
    
    // Prevent multiple connection attempts
    if (connectionInProgress) {
      toast.info('Connection already in progress');
      return false;
    }
    
    // Don't allow rapid reconnection attempts
    const now = Date.now();
    if (now - lastConnectionAttempt < 3000) {
      toast.info('Please wait before retrying connection');
      return false;
    }
    
    try {
      setConnectionInProgress(true);
      setLastConnectionAttempt(now);
      
      // Save credentials for convenience
      localStorage.setItem('gdrive-client-id', clientId);
      localStorage.setItem('gdrive-api-key', apiKey);
      
      toast.loading('Connecting to Google Drive...', {
        id: 'drive-connection',
        duration: Infinity
      });
      
      const success = await connectToDrive(clientId, apiKey);
      
      if (success) {
        toast.success('Connected to Google Drive', {
          id: 'drive-connection',
          description: 'Your documents are now available'
        });
      } else {
        toast.error('Failed to connect to Google Drive', {
          id: 'drive-connection',
          description: 'Please check your credentials and try again'
        });
      }
      
      return success;
    } catch (error) {
      toast.error('Connection error', {
        id: 'drive-connection',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    } finally {
      setConnectionInProgress(false);
    }
  }, [clientId, apiKey, connectToDrive, connectionInProgress, lastConnectionAttempt]);
  
  // Reset connection state
  const resetConnection = useCallback(() => {
    resetMcpConnection();
  }, [resetMcpConnection]);
  
  return {
    driveConnected,
    isLoading,
    connectionInProgress,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    resetConnection
  };
}
