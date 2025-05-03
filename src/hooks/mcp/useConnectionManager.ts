
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { dismissConnectionToasts, saveCredentials } from './utils/connectionUtils';
import { DriveConnectionState } from './types/driveConnectionTypes';

export function useConnectionManager(
  connectToDrive: (clientId: string, apiKey: string) => Promise<boolean>
) {
  // Connection state
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  const [lastConnectionResult, setLastConnectionResult] = useState<boolean | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  // Add a retry count to allow internal retries for connection
  const [retryCount, setRetryCount] = useState(0);
  const MAX_AUTO_RETRIES = 2;
  
  // Function to retry a connection automatically
  const retryConnection = useCallback(async (): Promise<boolean> => {
    if (retryCount >= MAX_AUTO_RETRIES) {
      console.log('Maximum auto-retry attempts reached');
      return false;
    }
    
    console.log(`Auto-retrying connection (attempt ${retryCount + 1}/${MAX_AUTO_RETRIES})...`);
    setRetryCount(prevCount => prevCount + 1);
    
    // Small delay before retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return handleConnect();
  }, [retryCount, clientId, apiKey]);
  
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
    
    // Dismiss any lingering toast notifications
    dismissConnectionToasts();
    
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
      }, 30000); // 30 seconds timeout
      
      setConnectionTimeout(timeout);
      
      // Save credentials for convenience - moved before connect to ensure credentials are saved
      saveCredentials(clientId, apiKey);
      
      console.log('Starting drive connection with credentials', { 
        clientId, 
        apiKeyLength: apiKey ? apiKey.length : 0
      });
      
      const success = await connectToDrive(clientId, apiKey);
      console.log('Drive connection result:', success);
      
      // Save the last connection result
      setLastConnectionResult(success);
      
      // Clear the timeout as we got a response
      clearTimeout(timeout);
      setConnectionTimeout(null);
      
      // Update connection status
      setConnectionStatus(success ? 'connected' : 'error');
      
      // If failed but we have retries left, try again
      if (!success && retryCount < MAX_AUTO_RETRIES) {
        console.log('Connection failed, attempting retry...');
        return retryConnection();
      }
      
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
          
          // If this is an API loading issue and we have retries left, try again
          if (retryCount < MAX_AUTO_RETRIES) {
            console.log('API loading issue, attempting retry...');
            return retryConnection();
          }
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
  }, [clientId, apiKey, connectToDrive, connectionInProgress, connectionTimeout, apiErrorCount, retryCount, retryConnection]);

  return {
    // State
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    connectionInProgress,
    connectionAttempts,
    connectionTimeout,
    apiErrorCount,
    lastConnectionResult,
    connectionStatus,
    setConnectionStatus,
    retryCount,
    
    // Actions
    setConnectionInProgress,
    setConnectionAttempts,
    setConnectionTimeout,
    setApiErrorCount,
    setLastConnectionResult,
    setRetryCount,
    
    // Main handlers
    handleConnect,
    retryConnection
  };
}
