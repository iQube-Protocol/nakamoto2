
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

export function useDriveConnection() {
  const { 
    driveConnected, 
    connectToDrive, 
    isLoading, 
    client, 
    isApiLoading, 
    resetDriveConnection: mcpResetConnection,
    getConnectionStatus 
  } = useMCP();
  
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  const [lastConnectionResult, setLastConnectionResult] = useState<boolean | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  // Try to load saved credentials from localStorage
  useEffect(() => {
    const savedClientId = localStorage.getItem('gdrive-client-id');
    const savedApiKey = localStorage.getItem('gdrive-api-key');
    
    if (savedClientId) setClientId(savedClientId);
    if (savedApiKey) setApiKey(savedApiKey);
    
    if (client?.isConnectedToDrive()) {
      console.log('Drive is already connected based on client state');
    }
    
    // Clean up any existing timeout on unmount
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    };
  }, [client, connectionTimeout]);
  
  // Sync connection status with MCP client
  useEffect(() => {
    if (client && typeof getConnectionStatus === 'function') {
      const status = getConnectionStatus();
      
      // Only update if different
      if (status !== connectionStatus) {
        setConnectionStatus(status);
        
        // If status changed to error or disconnected, reset connection in progress
        if (status === 'error' || status === 'disconnected') {
          setConnectionInProgress(false);
        } else if (status === 'connected') {
          // Successfully connected
          setConnectionInProgress(false);
        }
      }
    } else {
      // Default connection status based on driveConnected flag
      setConnectionStatus(driveConnected ? 'connected' : 'disconnected');
    }
  }, [client, driveConnected, getConnectionStatus, connectionStatus]);
  
  // Check API status periodically if errors occur
  useEffect(() => {
    // Only set up monitoring if we've seen API errors
    if (apiErrorCount > 0 && client) {
      const interval = setInterval(() => {
        // Check if API is now available
        if (client.isApiLoaded?.()) {
          console.log('API is now available after previous errors');
          setApiErrorCount(0);
          clearInterval(interval);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [apiErrorCount, client]);
  
  // Auto-reconnect if we have cached credentials and still show connected status
  useEffect(() => {
    const savedClientId = localStorage.getItem('gdrive-client-id');
    const savedApiKey = localStorage.getItem('gdrive-api-key');
    const cachedToken = localStorage.getItem('gdrive-auth-token');
    
    // If we have credentials, connection status is true, but last result was false
    // try to reconnect once
    if (savedClientId && savedApiKey && cachedToken && 
        driveConnected && lastConnectionResult === false && 
        client && !connectionInProgress) {
      console.log('Drive appears connected but last attempt failed. Trying auto-reconnect...');
      
      // Try to reconnect with cached credentials
      handleConnect();
    }
  }, [client, driveConnected, lastConnectionResult]);
  
  // Optimized connection handler with better error handling and timeout
  const handleConnect = useCallback(async () => {
    if (!clientId || !apiKey) {
      toast.error('Missing Google API credentials', {
        description: 'Both Client ID and API Key are required',
        duration: 3000,
        id: 'drive-connect-validation',
      });
      return false;
    }
    
    // Prevent multiple connection attempts
    if (connectionInProgress) {
      toast.info('Connection already in progress', {
        description: 'Please wait for the current connection attempt to complete',
        duration: 3000,
        id: 'drive-connect-inprogress',
      });
      return false;
    }
    
    // Clear any existing timeout
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
    
    try {
      setConnectionInProgress(true);
      setConnectionAttempts(prev => prev + 1);
      setConnectionStatus('connecting');
      
      // Set a timeout to prevent indefinite waiting
      const timeout = setTimeout(() => {
        setConnectionInProgress(false);
        setConnectionStatus('error');
        
        toast.dismiss('drive-connection');
        toast.error('Connection timed out', {
          description: 'The connection attempt took too long. Please try again.',
          duration: 5000,
          id: 'drive-connection-timeout',
        });
      }, 45000); // 45 seconds timeout
      
      setConnectionTimeout(timeout);
      
      // Save credentials for convenience
      localStorage.setItem('gdrive-client-id', clientId);
      localStorage.setItem('gdrive-api-key', apiKey);
      
      console.log('Starting drive connection with credentials', { clientId, apiKeyLength: apiKey?.length });
      const success = await connectToDrive(clientId, apiKey);
      console.log('Drive connection result:', success);
      
      // Save the last connection result
      setLastConnectionResult(success);
      
      // Clear the timeout as we got a response
      clearTimeout(timeout);
      setConnectionTimeout(null);
      
      // Update connection status
      setConnectionStatus(success ? 'connected' : 'error');
      
      return success;
    } catch (error) {
      console.error('Connection error:', error);
      setLastConnectionResult(false);
      setConnectionStatus('error');
      
      // Check if this might be an API loading issue
      if (error instanceof Error && (error.message.includes('gapi') || 
          error.message.includes('Google API') || 
          error.message.includes('not loaded'))) {
        setApiErrorCount(prev => prev + 1);
        
        toast.dismiss('drive-connection');
        if (apiErrorCount >= 2) {
          // After multiple API errors, suggest a reset
          toast.error('Google API not loading properly', {
            description: 'Try resetting the connection or refreshing the page',
            duration: 5000,
            id: 'api-error',
          });
        } else {
          toast.error('Google API not available', {
            description: 'Please wait a moment and try again',
            duration: 4000,
            id: 'api-error',
          });
        }
      } else {
        // Generic connection error
        toast.dismiss('drive-connection');
        toast.error('Connection error', {
          description: error instanceof Error ? error.message : 'Unknown error',
          duration: 4000,
          id: 'connection-error',
        });
      }
      
      return false;
    } finally {
      // Clean up the timeout if it's still active
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
      setConnectionInProgress(false);
    }
  }, [clientId, apiKey, connectToDrive, connectionInProgress, connectionTimeout, apiErrorCount]);
  
  // Add a reset connection function with improved error handling
  const resetConnection = useCallback(() => {
    try {
      // Clear any UI state
      setConnectionInProgress(false);
      setConnectionAttempts(0);
      setApiErrorCount(0);
      setLastConnectionResult(null);
      setConnectionStatus('disconnected');
      
      // Clear any existing timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
      
      // Show a resetting toast
      toast.loading('Resetting connection...', {
        id: 'reset-connection',
        duration: 3000,
      });
      
      if (client) {
        // Use MCP reset if available
        if (mcpResetConnection) {
          mcpResetConnection();
          
          toast.dismiss('reset-connection');
          toast.success('Connection reset complete', {
            description: 'You can now reconnect to Google Drive',
            duration: 3000,
            id: 'reset-success',
          });
        } else {
          // Clear connection status in localStorage as fallback
          localStorage.removeItem('gdrive-connected');
          localStorage.removeItem('gdrive-auth-token');
          
          toast.dismiss('reset-connection');
          toast.success('Connection state reset', {
            description: 'You can now reconnect to Google Drive',
            duration: 3000,
            id: 'reset-success',
          });
        }
      } else {
        // Handle case where client isn't available
        localStorage.removeItem('gdrive-connected');
        localStorage.removeItem('gdrive-auth-token');
        
        toast.dismiss('reset-connection');
        toast.info('Resetting connection state', {
          description: 'No active client detected',
          duration: 3000,
          id: 'reset-info',
        });
      }
      
      // Clear API-related cached data
      for (const key in localStorage) {
        if (key.startsWith('gdrive-') || key.includes('token')) {
          localStorage.removeItem(key);
        }
      }
      
      // Clear folder cache
      for (const key in sessionStorage) {
        if (key.startsWith('gdrive-folder-')) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error during connection reset:', error);
      
      toast.dismiss('reset-connection');
      toast.error('Error resetting connection', {
        description: 'Please refresh the page and try again',
        duration: 4000,
        id: 'reset-error',
      });
    }
  }, [client, connectionTimeout, mcpResetConnection]);
  
  return {
    driveConnected,
    isLoading,
    isApiLoading,
    connectionInProgress,
    connectionAttempts,
    connectionStatus,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    resetConnection
  };
}
