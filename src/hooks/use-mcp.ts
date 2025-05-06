
import { useState, useEffect, useCallback } from 'react';
import { getMCPClient } from '@/integrations/mcp';
import { useAuth } from '@/hooks/use-auth';
import { useMCPConnection } from './use-mcp-connection';
import { useMCPDocuments } from './use-mcp-documents';
import { useMCPContext } from './use-mcp-context';

/**
 * Main hook for MCP functionality that composes other specialized hooks
 */
export function useMCP() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const {
    client,
    isInitialized,
    driveConnected,
    isApiLoading,
    initializeClient,
    updateApiLoadingState,
    updateConnectionStatus,
    connectToDrive: connect,
    resetConnection: reset
  } = useMCPConnection();
  
  const {
    documents,
    isLoading: documentsLoading,
    listDocuments: list,
    forceRefreshDocuments: forceRefresh,
    fetchDocument: fetch,
    clearDocumentCaches
  } = useMCPDocuments();
  
  const {
    initializeContext: initialize
  } = useMCPContext();
  
  // Initialize MCP client
  useEffect(() => {
    if (user) {
      // Check if we already have a connection to Google Drive
      const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
      
      const mcpClient = getMCPClient({
        // Check for metisActive status from localStorage
        metisActive: localStorage.getItem('metisActive') === 'true',
        onApiLoadStart: () => updateApiLoadingState(true),
        onApiLoadComplete: () => updateApiLoadingState(false)
      });
      
      initializeClient(mcpClient, hasConnection);
      
      // Periodically verify the connection status
      const interval = setInterval(() => {
        const currentStatus = localStorage.getItem('gdrive-connected') === 'true';
        if (currentStatus !== driveConnected) {
          console.log('MCP: Drive connection status changed to', currentStatus);
          updateConnectionStatus(currentStatus);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, driveConnected, initializeClient, updateApiLoadingState, updateConnectionStatus]);
  
  // Connect to Google Drive wrapper
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    setIsLoading(true);
    
    try {
      const success = await connect(client, clientId, apiKey);
      
      if (success) {
        updateConnectionStatus(true);
      }
      
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [client, connect, updateConnectionStatus]);
  
  // Reset connection state wrapper
  const resetConnection = useCallback(() => {
    reset(client);
    updateConnectionStatus(false);
    clearDocumentCaches();
  }, [client, reset, updateConnectionStatus, clearDocumentCaches]);
  
  // Document listing wrapper
  const listDocuments = useCallback(async (folderId?: string) => {
    setIsLoading(true);
    
    try {
      return await list(client, driveConnected, folderId);
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected, list]);
  
  // Force refresh wrapper
  const forceRefreshDocuments = useCallback(async (folderId?: string) => {
    setIsLoading(true);
    
    try {
      return await forceRefresh(client, driveConnected, folderId);
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected, forceRefresh]);
  
  // Document fetch wrapper
  const fetchDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    
    try {
      return await fetch(client, driveConnected, documentId);
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected, fetch]);
  
  // Context initialization wrapper
  const initializeContext = useCallback(async (conversationId?: string) => {
    return initialize(client, conversationId);
  }, [client, initialize]);
  
  return {
    client,
    isInitialized,
    driveConnected,
    documents,
    isLoading: isLoading || documentsLoading,
    isApiLoading,
    connectToDrive,
    listDocuments,
    forceRefreshDocuments,
    fetchDocument,
    initializeContext,
    resetConnection
  };
}
