
import { useMCPClient } from './use-mcp-client';
import { useDriveConnection } from './use-drive-connection';
import { useDocumentOperations } from './use-document-operations';
import { useContextManagement } from './use-context-management';

/**
 * Main MCP hook that combines all MCP-related functionality
 */
export function useMCP() {
  // Initialize client
  const { client, isInitialized } = useMCPClient();
  
  // Drive connection management
  const { 
    driveConnected, 
    isLoading: connectionLoading, 
    connectToDrive, 
    resetDriveConnection 
  } = useDriveConnection(client);
  
  // Document operations
  const { 
    documents,
    isLoading: documentsLoading, 
    listDocuments, 
    fetchDocument 
  } = useDocumentOperations(client, driveConnected);
  
  // Context management
  const { 
    initializeContext, 
    refreshContext, 
    getCurrentContextId 
  } = useContextManagement(client);
  
  // Combine loading states
  const isLoading = connectionLoading || documentsLoading;
  
  return {
    // Client state
    client,
    isInitialized,
    
    // Drive connection
    driveConnected,
    connectToDrive,
    resetDriveConnection,
    
    // Document operations
    documents,
    listDocuments,
    fetchDocument,
    
    // Context management
    initializeContext,
    refreshContext,
    getCurrentContextId,
    
    // UI state
    isLoading
  };
}

// Re-export all hooks for direct import when needed
export * from './use-mcp-client';
export * from './use-drive-connection';
export * from './use-document-operations';
export * from './use-context-management';
