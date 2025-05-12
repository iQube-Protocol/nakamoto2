
import { useState, useEffect, useCallback } from 'react';
import { getKBAIService, KBAIKnowledgeItem, KBAIQueryOptions } from '@/integrations/kbai/KBAIMCPService';
import { toast } from 'sonner';

export interface KnowledgeBaseState {
  items: KBAIKnowledgeItem[];
  isLoading: boolean;
  error: Error | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  lastAttemptTimestamp: number | null;
}

export function useKnowledgeBase(options: KBAIQueryOptions = {}) {
  const [state, setState] = useState<KnowledgeBaseState>({
    items: [],
    isLoading: false,
    error: null,
    connectionStatus: 'disconnected',
    errorMessage: null,
    lastAttemptTimestamp: null
  });
  const [queryOptions, setQueryOptions] = useState<KBAIQueryOptions>(options);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Get KBAI service
  const kbaiService = getKBAIService();
  
  // Fetch knowledge items
  const fetchKnowledgeItems = useCallback(async (newOptions?: KBAIQueryOptions) => {
    // If new options are provided, update the query options
    if (newOptions) {
      setQueryOptions(prevOptions => ({ ...prevOptions, ...newOptions }));
    }
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      connectionStatus: 'connecting',
      lastAttemptTimestamp: Date.now() 
    }));
    
    try {
      // First check if the edge function is available
      console.log('Checking edge function health before fetching knowledge items');
      const isHealthy = await kbaiService.checkEdgeFunctionHealth().catch(() => false);
      
      if (!isHealthy) {
        console.warn('Edge function health check failed, proceeding with attempt anyway');
      }
      
      // Use current options merged with any new options
      const currentOptions = newOptions ? { ...queryOptions, ...newOptions } : queryOptions;
      console.log(`Attempting to fetch knowledge items with options:`, currentOptions);
      
      const items = await kbaiService.fetchKnowledgeItems(currentOptions);
      const { status, errorMessage } = kbaiService.getConnectionInfo();
      
      setState({
        items,
        isLoading: false,
        error: null,
        connectionStatus: status,
        errorMessage,
        lastAttemptTimestamp: Date.now()
      });
      
      console.log(`Fetched ${items.length} knowledge items with status: ${status}`);
      
      if (status === 'connected') {
        setReconnectAttempts(0); // Reset reconnect attempts on success
        toast({
          title: 'Connected to knowledge base',
          duration: 2000
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error in useKnowledgeBase:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        connectionStatus: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
        lastAttemptTimestamp: Date.now()
      }));
      
      // Show toast with error message and troubleshooting info
      toast({
        title: 'Knowledge base connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect to knowledge base',
        variant: 'destructive'
      });
      
      return false;
    }
  }, [kbaiService, queryOptions]);
  
  // Update query options
  const updateQueryOptions = useCallback((newOptions: KBAIQueryOptions) => {
    setQueryOptions(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  // Search knowledge base
  const searchKnowledge = useCallback((query: string) => {
    updateQueryOptions({ query });
    fetchKnowledgeItems({ query });
  }, [updateQueryOptions, fetchKnowledgeItems]);
  
  // Reset search
  const resetSearch = useCallback(() => {
    const resetOptions = { query: '' };
    updateQueryOptions(resetOptions);
    fetchKnowledgeItems(resetOptions);
  }, [updateQueryOptions, fetchKnowledgeItems]);

  // Run diagnostics on the knowledge base connection
  const runDiagnostics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('Running knowledge base connection diagnostics...');
      
      // Step 1: Check edge function health
      const isEdgeFunctionHealthy = await kbaiService.checkEdgeFunctionHealth();
      console.log('Edge function health check result:', isEdgeFunctionHealthy);
      
      // Step 2: Get current connection info
      const connectionInfo = kbaiService.getConnectionInfo();
      console.log('Current connection info:', connectionInfo);
      
      // Step 3: Return diagnostic results
      const diagnosticResults = {
        edgeFunctionHealthy: isEdgeFunctionHealthy,
        connectionStatus: connectionInfo.status,
        errorMessage: connectionInfo.errorMessage,
        timestamp: new Date().toISOString()
      };
      
      console.log('Diagnostic results:', diagnosticResults);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        errorMessage: prev.errorMessage + '\n\nDiagnostics: ' + JSON.stringify(diagnosticResults)
      }));
      
      return diagnosticResults;
    } catch (error) {
      console.error('Error running diagnostics:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        errorMessage: `Diagnostics error: ${error.message}`
      }));
      
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }, [kbaiService]);

  // Force a reconnect attempt with improved logging
  const reconnect = useCallback(async () => {
    console.log('Attempting to reconnect to KBAI server...');
    setReconnectAttempts(prev => prev + 1);
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      connectionStatus: 'connecting',
      errorMessage: null 
    }));
    
    kbaiService.reset();
    
    try {
      await fetchKnowledgeItems(queryOptions);
      console.log('KBAI reconnection successful');
      return true;
    } catch (error) {
      console.error('KBAI reconnection failed:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        connectionStatus: 'error',
        errorMessage: `Reconnection failed: ${error.message || 'Unknown error'}`
      }));
      return false;
    }
  }, [kbaiService, fetchKnowledgeItems, queryOptions]);
  
  return {
    ...state,
    fetchKnowledgeItems,
    updateQueryOptions,
    searchKnowledge,
    resetSearch,
    reconnect,
    runDiagnostics,
    reconnectAttempts
  };
}
