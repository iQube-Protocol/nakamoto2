
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

export function useDriveConnection() {
  const { driveConnected, connectToDrive, isLoading, client, isApiLoading, resetDriveConnection: mcpResetConnection } = useMCP();
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  const [lastConnectionResult, setLastConnectionResult] = useState<boolean | null>(null);
  
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
        description: 'Both Client ID and API Key are required'
      });
      return false;
    }
    
    // Prevent multiple connection attempts
    if (connectionInProgress) {
      toast.info('Connection already in progress', {
        description: 'Please wait for the current connection attempt to complete'
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
      
      // Set a timeout to prevent indefinite waiting
      const timeout = setTimeout(() => {
        setConnectionInProgress(false);
        toast.error('Connection timed out', {
          id: 'drive-connection',
          description: 'The connection attempt took too long. Please try again.'
        });
      }, 45000); // 45 seconds timeout
      
      setConnectionTimeout(timeout);
      
      // Save credentials for convenience
      localStorage.setItem('gdrive-client-id', clientId);
      localStorage.setItem('gdrive-api-key', apiKey);
      
      toast.loading('Connecting to Google Drive...', {
        id: 'drive-connection',
        duration: Infinity
      });
      
      console.log('Starting drive connection with credentials', { clientId, apiKeyLength: apiKey?.length });
      const success = await connectToDrive(clientId, apiKey);
      console.log('Drive connection result:', success);
      
      // Save the last connection result
      setLastConnectionResult(success);
      
      // Clear the timeout as we got a response
      clearTimeout(timeout);
      setConnectionTimeout(null);
      
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
      console.error('Connection error:', error);
      setLastConnectionResult(false);
      
      // Check if this might be an API loading issue
      if (error instanceof Error && (error.message.includes('gapi') || 
          error.message.includes('Google API') || 
          error.message.includes('not loaded'))) {
        setApiErrorCount(prev => prev + 1);
        
        if (apiErrorCount >= 2) {
          // After multiple API errors, suggest a reset
          toast.error('Google API not loading properly', {
            id: 'drive-connection',
            description: 'Try resetting the connection or refreshing the page'
          });
        } else {
          toast.error('Google API not available', {
            id: 'drive-connection',
            description: 'Please wait a moment and try again'
          });
        }
      } else {
        // Generic connection error
        toast.error('Connection error', {
          id: 'drive-connection',
          description: error instanceof Error ? error.message : 'Unknown error'
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
      if (client) {
        // Clear any existing timeout
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          setConnectionTimeout(null);
        }
        
        // Reset connection state
        setConnectionInProgress(false);
        setConnectionAttempts(0);
        setApiErrorCount(0);
        setLastConnectionResult(null);
        
        // Use MCP reset if available, otherwise do a local reset
        if (mcpResetConnection) {
          mcpResetConnection();
        } else {
          // Clear connection status in localStorage
          localStorage.removeItem('gdrive-connected');
          localStorage.removeItem('gdrive-auth-token');
          
          toast.success('Connection state reset', {
            description: 'You can now reconnect to Google Drive'
          });
        }
      } else {
        // Handle case where client isn't available
        toast.info('Resetting connection state', {
          description: 'No active client detected'
        });
        
        // Still clear localStorage items
        localStorage.removeItem('gdrive-connected');
        localStorage.removeItem('gdrive-auth-token');
      }
    } catch (error) {
      console.error('Error during connection reset:', error);
      toast.error('Error resetting connection', {
        description: 'Please refresh the page and try again'
      });
    }
  }, [client, connectionTimeout, mcpResetConnection]);
  
  return {
    driveConnected,
    isLoading,
    isApiLoading,
    connectionInProgress,
    connectionAttempts,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    resetConnection
  };
}
