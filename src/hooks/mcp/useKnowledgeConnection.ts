
import { useState, useCallback } from 'react';
import { getKBAIService, ConnectionStatus, DiagnosticResult } from '@/integrations/kbai';
import { toast } from 'sonner';

export interface ConnectionState {
  connectionStatus: ConnectionStatus;
  errorMessage: string | null;
  reconnectAttempts: number;
  isLoading: boolean;
}

/**
 * Hook for managing knowledge base connection
 */
export function useKnowledgeConnection() {
  const [state, setState] = useState<ConnectionState>({
    connectionStatus: 'disconnected',
    errorMessage: null,
    reconnectAttempts: 0,
    isLoading: false
  });
  
  // Get KBAI service
  const kbaiService = getKBAIService();
  
  // Check connection status
  const checkConnectionStatus = useCallback(() => {
    const { status, errorMessage } = kbaiService.getConnectionInfo();
    
    setState(prev => ({
      ...prev,
      connectionStatus: status,
      errorMessage
    }));
    
    return { status, errorMessage };
  }, [kbaiService]);
  
  // Force a reconnect attempt with improved logging
  const reconnect = useCallback(async () => {
    console.log('Attempting to reconnect to KBAI server...');
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      connectionStatus: 'connecting',
      errorMessage: null,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));
    
    kbaiService.reset();
    
    try {
      // First check if the edge function is reachable
      const isHealthy = await kbaiService.checkEdgeFunctionHealth();
      console.log('Edge function health check result:', isHealthy);
      
      if (!isHealthy) {
        toast.error("Edge Function Not Available", {
          description: "The KBAI connector function appears to be unavailable. Please ensure it's deployed to Supabase."
        });
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          connectionStatus: 'error',
          errorMessage: "Edge function not deployed or not accessible"
        }));
        return false;
      }
      
      if (isHealthy) {
        toast("Edge function is available. Attempting to reconnect...");
      }
      
      // Try to establish connection by fetching initial items
      await kbaiService.fetchKnowledgeItems({});
      
      // Get updated connection info
      const { status, errorMessage } = kbaiService.getConnectionInfo();
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        connectionStatus: status,
        errorMessage
      }));
      
      if (status === 'connected') {
        toast.success("Successfully reconnected to knowledge base");
        return true;
      } else {
        toast("Reconnection attempt completed, but connection is not fully established");
        return false;
      }
    } catch (error) {
      console.error('KBAI reconnection failed:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        connectionStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }));
      
      toast.error(`Reconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [kbaiService]);
  
  // Run diagnostics on the knowledge base connection
  const runDiagnostics = useCallback(async (): Promise<DiagnosticResult> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('Running knowledge base connection diagnostics...');
      const diagnosticResults = await kbaiService.runDiagnostics();
      
      // Update state with latest connection status
      const connectionInfo = kbaiService.getConnectionInfo();
      setState(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: connectionInfo.status,
        errorMessage: connectionInfo.errorMessage
      }));
      
      return diagnosticResults;
    } catch (error) {
      console.error('Error running diagnostics:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        errorMessage: `Diagnostics error: ${error instanceof Error ? error.message : String(error)}`
      }));
      
      return {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }, [kbaiService]);
  
  return {
    ...state,
    checkConnectionStatus,
    reconnect,
    runDiagnostics
  };
}
