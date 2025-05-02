
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

export function useDriveConnection() {
  const { driveConnected, connectToDrive, isLoading, client, isApiLoading } = useMCP();
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  
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
      }, 45000); // Increased from 40 to 45 seconds timeout
      
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
      toast.error('Connection error', {
        id: 'drive-connection',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    } finally {
      // Clean up the timeout if it's still active
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
      setConnectionInProgress(false);
    }
  }, [clientId, apiKey, connectToDrive, connectionInProgress, connectionTimeout]);
  
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
    handleConnect
  };
}
