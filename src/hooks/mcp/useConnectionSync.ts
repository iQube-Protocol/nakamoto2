
import { useEffect } from 'react';

interface ConnectionSyncProps {
  client: any;
  driveConnected: boolean;
  getConnectionStatus?: () => 'disconnected' | 'connecting' | 'connected' | 'error';
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setConnectionInProgress: (inProgress: boolean) => void;
  lastConnectionResult: boolean | null;
  handleConnect: () => Promise<boolean>;
}

export function useConnectionSync({
  client, 
  driveConnected,
  getConnectionStatus,
  connectionStatus,
  setConnectionStatus,
  setConnectionInProgress,
  lastConnectionResult,
  handleConnect
}: ConnectionSyncProps) {
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
  }, [client, driveConnected, getConnectionStatus, connectionStatus, setConnectionStatus, setConnectionInProgress]);
  
  // Auto-reconnect if we have cached credentials and still show connected status
  useEffect(() => {
    const savedClientId = localStorage.getItem('gdrive-client-id');
    const savedApiKey = localStorage.getItem('gdrive-api-key');
    const cachedToken = localStorage.getItem('gdrive-auth-token');
    
    // If we have credentials, connection status is true, but last result was false
    // try to reconnect once
    if (savedClientId && savedApiKey && cachedToken && 
        driveConnected && lastConnectionResult === false && 
        client && connectionStatus !== 'connecting') {
      console.log('Drive appears connected but last attempt failed. Trying auto-reconnect...');
      
      // Try to reconnect with cached credentials
      handleConnect();
    }
  }, [client, driveConnected, lastConnectionResult, connectionStatus, handleConnect]);

  return null;
}
