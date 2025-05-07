
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
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Load saved credentials from localStorage
  useEffect(() => {
    const savedClientId = localStorage.getItem('gdrive-client-id');
    const savedApiKey = localStorage.getItem('gdrive-api-key');
    
    if (savedClientId) setClientId(savedClientId);
    if (savedApiKey) setApiKey(savedApiKey);
    
    if (client?.isConnectedToDrive()) {
      console.log('Drive is already connected based on client state');
    }
    
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    };
  }, [client]);
  
  // Clear any stale connection state
  useEffect(() => {
    // If we're on the Learn page and we have credentials but aren't connected,
    // ensure connection state is clean
    if (!driveConnected && clientId && apiKey && window.location.pathname.includes('/learn')) {
      console.log('Cleaning up stale connection state on Learn page');
      localStorage.removeItem('gdrive-connected');
    }
  }, [driveConnected, clientId, apiKey]);
  
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
    if (now - lastConnectionAttempt < 5000) { // 5 seconds cooldown
      toast.info('Please wait before retrying connection');
      return false;
    }
    
    try {
      setConnectionInProgress(true);
      setLastConnectionAttempt(now);
      
      // Clear any previous connection state to ensure a fresh start
      localStorage.removeItem('gdrive-connected');
      localStorage.removeItem('gdrive-auth-token');
      
      // Set a timeout to automatically clear the connection state if it takes too long
      const timeout = setTimeout(() => {
        console.log('Connection attempt timed out, resetting state');
        setConnectionInProgress(false);
      }, 30000); // 30 second timeout
      
      setConnectionTimeout(timeout);
      
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
      
      // Clear the timeout since we completed normally
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
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
  }, [clientId, apiKey, connectToDrive, connectionInProgress, lastConnectionAttempt, connectionTimeout]);
  
  // Reset connection state
  const resetConnection = useCallback(() => {
    localStorage.removeItem('gdrive-connected');
    localStorage.removeItem('gdrive-auth-token');
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
