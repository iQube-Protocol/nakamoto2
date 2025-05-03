
import { useState, useEffect } from 'react';
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

  // Connection parameters
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  // Initialize the client
  useEffect(() => {
    // Check if we already have a connection to Google Drive
    const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
    
    const mcpClient = getMCPClient({
      metisActive: localStorage.getItem('metisActive') === 'true',
      debug: true,
      apiLoadTimeout: 30000,
      onApiLoadStart: () => {
        console.log('Drive Connection: API loading started');
        setIsApiLoading(true);
      },
      onApiLoadComplete: () => {
        console.log('Drive Connection: API loading completed');
        setIsApiLoading(false);
      }
    });
    
    // Try to load saved credentials
    const savedClientId = localStorage.getItem('gdrive-client-id');
    const savedApiKey = localStorage.getItem('gdrive-api-key');
    
    if (savedClientId) setClientId(savedClientId);
    if (savedApiKey) setApiKey(savedApiKey);
    
    setClient(mcpClient);
    setIsInitialized(true);
    setDriveConnected(hasConnection);
    setConnectionStatus(hasConnection ? 'connected' : 'disconnected');
  }, []);
  
  // Verify connection status periodically
  useEffect(() => {
    if (!client || !driveConnected) return;
    
    const interval = setInterval(() => {
      const isConnected = client.isConnectedToDrive();
      if (driveConnected !== isConnected) {
        setDriveConnected(isConnected);
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [client, driveConnected]);
  
  // Connect to Google Drive - explicitly exported for useConnectionState
  const connectToDrive = async (clientIdParam?: string, apiKeyParam?: string): Promise<boolean> => {
    if (!client || connectionInProgress) return false;
    
    try {
      setConnectionInProgress(true);
      setConnectionAttempts(prev => prev + 1);
      setConnectionStatus('connecting');
      
      // Use provided parameters or the state values
      const finalClientId = clientIdParam || clientId;
      const finalApiKey = apiKeyParam || apiKey;
      
      // Save credentials to localStorage
      localStorage.setItem('gdrive-client-id', finalClientId);
      localStorage.setItem('gdrive-api-key', finalApiKey);
      
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      
      console.log('Connecting to Google Drive...');
      const result = await client.connectToDrive(finalClientId, finalApiKey, cachedToken);
      
      setDriveConnected(result);
      setConnectionStatus(result ? 'connected' : 'error');
      
      if (result) {
        localStorage.setItem('gdrive-connected', 'true');
        console.log('Successfully connected to Google Drive');
      } else {
        localStorage.removeItem('gdrive-connected');
        console.error('Failed to connect to Google Drive');
      }
      
      return result;
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      setConnectionStatus('error');
      setApiLoadError(error instanceof Error ? error : new Error('Unknown error'));
      return false;
    } finally {
      setConnectionInProgress(false);
    }
  };
  
  // Reset connection
  const resetConnection = () => {
    localStorage.removeItem('gdrive-connected');
    localStorage.removeItem('gdrive-auth-token');
    
    if (client) {
      client.resetDriveConnection();
      
      // Force reload Google API
      try {
        client.reloadGoogleApi();
      } catch (e) {
        console.error('Error reloading Google API:', e);
      }
    }
    
    setDriveConnected(false);
    setConnectionStatus('disconnected');
    setConnectionAttempts(0);
    console.log('Drive connection reset');
  };
  
  // Check API status
  const checkApiStatus = (): boolean => {
    return client?.isApiLoaded() || false;
  };
  
  // Get connection status
  const getConnectionStatus = (): 'disconnected' | 'connecting' | 'connected' | 'error' => {
    if (!client) return 'disconnected';
    return client.getConnectionStatus();
  };

  return {
    client,
    isInitialized,
    driveConnected,
    isLoading,
    isApiLoading,
    apiLoadError,
    connectionStatus,
    getConnectionStatus,
    checkApiStatus,
    connectToDrive, // Explicitly expose this function for useConnectionState
    resetConnection,
    
    // Connection parameters
    clientId,
    apiKey,
    setClientId,
    setApiKey,
    connectionInProgress,
    connectionAttempts,
    connectionTimeout: 30000,
    apiErrorCount: 0,
    lastConnectionResult: driveConnected,
  };
}
