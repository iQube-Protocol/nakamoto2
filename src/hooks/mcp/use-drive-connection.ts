
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { MCPClient, getMCPClient } from '@/integrations/mcp/client';

/**
 * Hook to manage Google Drive connection state
 */
export function useDriveConnection() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiLoadError, setApiLoadError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // Initialize MCP client
  useEffect(() => {
    // Check if we already have a connection to Google Drive
    const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
    console.log('useDriveConnection: Initial connection state from localStorage:', hasConnection);
    
    const mcpClient = getMCPClient({
      // Check for metisActive status from localStorage
      metisActive: localStorage.getItem('metisActive') === 'true',
      onApiLoadStart: () => {
        console.log('MCP API loading started');
        setIsApiLoading(true);
        setApiLoadError(null);
      },
      onApiLoadComplete: () => {
        console.log('MCP API loading completed');
        setIsApiLoading(false);
      }
    });
    
    setClient(mcpClient);
    setIsInitialized(true);
    setDriveConnected(hasConnection);
    setConnectionStatus(hasConnection ? 'connected' : 'disconnected');
  }, []);
  
  // Setup periodic connection verification
  useEffect(() => {
    if (client && driveConnected) {
      const interval = setInterval(() => {
        // Verify the connection is still valid by checking local storage and API state
        const storedConnectionState = localStorage.getItem('gdrive-connected') === 'true';
        const apiLoaded = client.isApiLoaded();
        const clientConnected = client.isConnectedToDrive();
        
        const isActuallyConnected = storedConnectionState && apiLoaded && clientConnected;
        
        if (driveConnected !== isActuallyConnected) {
          console.log(`useDriveConnection: Connection state mismatch detected. Updating from ${driveConnected} to ${isActuallyConnected}`);
          setDriveConnected(isActuallyConnected);
          setConnectionStatus(isActuallyConnected ? 'connected' : 'disconnected');
          localStorage.setItem('gdrive-connected', isActuallyConnected ? 'true' : 'false');
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [client, driveConnected]);

  // Connect to Google Drive with optimized flow
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    // Dismiss any lingering toasts to prevent duplicates
    toast.dismiss('mcp-connect');
    toast.dismiss('drive-connection');
    toast.dismiss('connecting-message');
    
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      // Validate that we have the required credentials
      if (!clientId || !apiKey) {
        toast.error('Missing Google API credentials', { 
          duration: 3000,
          id: 'mcp-credentials-error',
        });
        setConnectionStatus('error');
        return false;
      }
      
      // Use cached token if available
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      console.log('useDriveConnection: Cached auth token exists:', !!cachedToken);
      
      // Show a short-lived connecting toast
      toast.loading('Connecting to Google Drive...', {
        id: 'connecting-message',
        duration: 10000, // Auto-dismiss after 10s if the connection hangs
      });
      
      console.log('useDriveConnection: Connecting to Drive with clientId, apiKey, and cachedToken');
      
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey, cachedToken);
      
      // Dismiss the connecting toast
      toast.dismiss('connecting-message');
      
      console.log('useDriveConnection: Drive connection result:', success);
      if (success) {
        localStorage.setItem('gdrive-connected', 'true');
        setDriveConnected(true);
        setConnectionStatus('connected');
        return true;
      } else {
        // Make sure we clean up any stale state if connection failed
        localStorage.setItem('gdrive-connected', 'false');
        setDriveConnected(false);
        setConnectionStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      
      // Dismiss the connecting toast
      toast.dismiss('connecting-message');
      
      toast.error('Failed to connect to Google Drive', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 4000,
        id: 'mcp-connect-error',
      });
      
      // Make sure we clean up on error
      localStorage.setItem('gdrive-connected', 'false');
      setDriveConnected(false);
      setConnectionStatus('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Reset drive connection with improved handling
  const resetDriveConnection = useCallback(() => {
    // Dismiss any existing toasts to prevent stacking
    toast.dismiss('reset-connection');
    toast.dismiss('drive-connection');
    toast.dismiss('connecting-message');
    toast.dismiss('mcp-connect');
    
    if (client) {
      // Reset internal state in the client
      client.resetDriveConnection();
      
      // Clear connection status in localStorage
      localStorage.removeItem('gdrive-connected');
      localStorage.removeItem('gdrive-auth-token');
      
      // Update local state
      setDriveConnected(false);
      setConnectionStatus('disconnected');
      setApiLoadError(null);
      
      // Clear cache
      for (const key in sessionStorage) {
        if (key.startsWith('gdrive-folder-')) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }, [client]);
  
  // Get the current connection status from the client
  const getConnectionStatus = useCallback((): 'disconnected' | 'connecting' | 'connected' | 'error' => {
    if (!client) return 'disconnected';
    
    // Check if the DriveOperations class has a status getter method
    if (typeof client.getConnectionStatus === 'function') {
      return client.getConnectionStatus();
    }
    
    // Default to the driveConnected state if method is not available
    return driveConnected ? 'connected' : 'disconnected';
  }, [client, driveConnected]);
  
  // Update state based on localStorage changes (in case of multi-tab operation)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gdrive-connected') {
        const newConnected = e.newValue === 'true';
        if (driveConnected !== newConnected) {
          console.log('useDriveConnection: Connection state changed via localStorage:', newConnected);
          setDriveConnected(newConnected);
          setConnectionStatus(newConnected ? 'connected' : 'disconnected');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [driveConnected]);
  
  // Check API status
  const checkApiStatus = useCallback(() => {
    if (!client) return false;
    
    // Check if Google API is loaded successfully
    const isLoaded = client.isApiLoaded?.();
    console.log('MCP API loaded status:', isLoaded);
    
    return isLoaded;
  }, [client]);

  return {
    client,
    isInitialized,
    driveConnected,
    isLoading,
    isApiLoading,
    apiLoadError,
    connectionStatus,
    getConnectionStatus,
    connectToDrive,
    resetDriveConnection,
    checkApiStatus
  };
}
