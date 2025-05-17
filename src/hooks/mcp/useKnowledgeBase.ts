
import { useState, useEffect, useCallback } from 'react';
import { KBAIKnowledgeItem, KBAIQueryOptions } from '@/integrations/kbai';
import { getKBAIService } from '@/integrations/kbai/KBAIMCPService';
import { getKBAIDirectService } from '@/integrations/kbai/KBAIDirectService';
import { toast } from 'sonner';

export interface KnowledgeBaseState {
  items: KBAIKnowledgeItem[];
  isLoading: boolean;
  error: Error | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export function useKnowledgeBase(options: KBAIQueryOptions = {}) {
  const [state, setState] = useState<KnowledgeBaseState>({
    items: [],
    isLoading: false,
    error: null,
    connectionStatus: 'disconnected'
  });
  const [queryOptions, setQueryOptions] = useState<KBAIQueryOptions>(options);
  
  // Get KBAI services
  const kbaiService = getKBAIService();
  const kbaiDirectService = getKBAIDirectService();
  
  // Fetch knowledge items
  const fetchKnowledgeItems = useCallback(async (forceRefresh = false) => {
    if (state.isLoading) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // If force refresh is requested, add it to the query options
      const fetchOptions = forceRefresh ? 
        { ...queryOptions, query: 'force-refresh' } : 
        queryOptions;
      
      const items = await kbaiService.fetchKnowledgeItems(fetchOptions);
      const status = kbaiService.getConnectionStatus();
      
      setState({
        items,
        isLoading: false,
        error: null,
        connectionStatus: status
      });
      
      console.log(`Fetched ${items.length} knowledge items with status: ${status}`);
      
      // Only show success toast when forcing refresh
      if (forceRefresh && status === 'connected') {
        toast.success('Knowledge base refreshed', {
          description: `${items.length} items retrieved`
        });
      }
      
      // If it's an error and force refresh was requested, notify
      if (status === 'error' && forceRefresh) {
        toast.error('Knowledge base connection issue', {
          description: 'Using cached or fallback data',
        });
      }
      
      return items;
    } catch (error) {
      console.error('Error in useKnowledgeBase:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        connectionStatus: 'error'
      }));
      
      // Check if it's a CORS error
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('CORS') || errorMsg.includes('NetworkError')) {
        toast.error('CORS issue with knowledge base', {
          description: 'Using fallback data instead',
          id: 'kbai-cors-error', // Prevent duplicate toasts
        });
      }
      
      throw error;
    }
  }, [kbaiService, queryOptions, state.isLoading]);
  
  // Force reconnect to KBAI service
  const retryConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, connectionStatus: 'connecting' }));
    
    try {
      // First try to force refresh the direct service
      const success = await kbaiDirectService.forceRefresh();
      
      if (success) {
        // If successful, fetch items with the refreshed connection
        await fetchKnowledgeItems(true);
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          connectionStatus: 'error'
        }));
        return false;
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        connectionStatus: 'error'
      }));
      
      // Only show toast if not a duplicate error
      toast.error('Connection retry failed', {
        description: 'Please check network connectivity',
        id: 'kbai-retry-error', // Prevent duplicate toasts
      });
      return false;
    }
  }, [kbaiDirectService, fetchKnowledgeItems]);
  
  // Update query options
  const updateQueryOptions = useCallback((newOptions: KBAIQueryOptions) => {
    setQueryOptions(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  // Search knowledge base
  const searchKnowledge = useCallback((query: string) => {
    updateQueryOptions({ query });
  }, [updateQueryOptions]);
  
  // Reset search
  const resetSearch = useCallback(() => {
    updateQueryOptions({ query: '' });
  }, [updateQueryOptions]);
  
  // Fetch knowledge items when component mounts or options change
  useEffect(() => {
    fetchKnowledgeItems();
  }, [fetchKnowledgeItems]);
  
  return {
    ...state,
    fetchKnowledgeItems,
    retryConnection,
    updateQueryOptions,
    searchKnowledge,
    resetSearch
  };
}
