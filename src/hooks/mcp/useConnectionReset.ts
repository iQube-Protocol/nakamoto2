
import { useCallback } from 'react';
import { toast } from 'sonner';
import { dismissConnectionToasts, clearConnectionStorage } from './utils/connectionUtils';

export function useConnectionReset(
  connectionManager: {
    connectionTimeout: NodeJS.Timeout | null;
    setConnectionInProgress: (state: boolean) => void;
    setConnectionAttempts: (value: number | ((prev: number) => number)) => void;
    setApiErrorCount: (value: number | ((prev: number) => number)) => void;
    setLastConnectionResult: (result: boolean | null) => void;
    setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
    setConnectionTimeout: (timeout: NodeJS.Timeout | null) => void;
  },
  mcpClient: any,
  mcpResetConnection?: () => void
) {
  // Add a reset connection function with improved error handling
  const resetConnection = useCallback(() => {
    try {
      const {
        connectionTimeout,
        setConnectionInProgress,
        setConnectionAttempts,
        setApiErrorCount,
        setLastConnectionResult,
        setConnectionStatus,
        setConnectionTimeout
      } = connectionManager;
      
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
      
      // Dismiss any lingering toast notifications
      dismissConnectionToasts();
      
      // Show a resetting toast that will auto-dismiss
      toast.loading('Resetting connection...', {
        id: 'reset-connection',
        duration: 3000,
      });
      
      if (mcpClient) {
        // Use MCP reset if available
        if (mcpResetConnection) {
          mcpResetConnection();
          
          // Short-lived success toast
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
      
      // Clear storage
      clearConnectionStorage();
    } catch (error) {
      console.error('Error during connection reset:', error);
      
      toast.dismiss('reset-connection');
      toast.error('Error resetting connection', {
        description: 'Please refresh the page and try again',
        duration: 4000,
        id: 'reset-error',
      });
    }
  }, [connectionManager, mcpClient, mcpResetConnection]);

  return { resetConnection };
}
