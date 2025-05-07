
import { useCallback } from 'react';
import { toast } from 'sonner';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Hook for connection operations like connect and reset
 */
export function useConnectionOperations(
  client: MCPClient | null,
  setDriveConnected: (state: boolean) => void,
  setIsLoading: (state: boolean) => void,
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void
) {
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
      console.log('useConnectionOperations: Cached auth token exists:', !!cachedToken);
      
      // Show a short-lived connecting toast
      toast.loading('Connecting to Google Drive...', {
        id: 'connecting-message',
        duration: 10000, // Auto-dismiss after 10s if the connection hangs
      });
      
      console.log('useConnectionOperations: Connecting to Drive with clientId, apiKey, and cachedToken');
      
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey, cachedToken);
      
      // Dismiss the connecting toast
      toast.dismiss('connecting-message');
      
      console.log('useConnectionOperations: Drive connection result:', success);
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
  }, [client, setDriveConnected, setIsLoading, setConnectionStatus]);
  
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
      
      // Clear cache
      for (const key in sessionStorage) {
        if (key.startsWith('gdrive-folder-')) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }, [client, setDriveConnected, setConnectionStatus]);
  
  return {
    connectToDrive,
    resetDriveConnection
  };
}
