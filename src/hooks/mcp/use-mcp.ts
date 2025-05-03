
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDriveConnection } from './use-drive-connection';
import { useDocumentOperations } from './use-document-operations';
import { useContextManagement } from './use-context-management';

/**
 * Main hook combining all MCP functionality
 */
export function useMCP() {
  const { user } = useAuth();
  
  // Use the individual hooks to compose the complete MCP functionality
  const driveConnection = useDriveConnection();
  const documentOperations = useDocumentOperations(
    driveConnection.client,
    driveConnection.driveConnected,
    driveConnection.resetDriveConnection
  );
  const contextManagement = useContextManagement(driveConnection.client);
  
  // Initialize MCP client when user is authenticated
  useEffect(() => {
    // Connection is handled in the useDriveConnection hook
    console.log('useMCP: User authentication state changed', !!user);
  }, [user]);

  return {
    // From useDriveConnection
    client: driveConnection.client,
    isInitialized: driveConnection.isInitialized,
    driveConnected: driveConnection.driveConnected,
    isApiLoading: driveConnection.isApiLoading,
    apiLoadError: driveConnection.apiLoadError,
    connectionStatus: driveConnection.connectionStatus,
    getConnectionStatus: driveConnection.getConnectionStatus,
    connectToDrive: driveConnection.connectToDrive,
    resetDriveConnection: driveConnection.resetDriveConnection,
    checkApiStatus: driveConnection.checkApiStatus,
    
    // From useDocumentOperations
    documents: documentOperations.documents,
    listDocuments: documentOperations.listDocuments,
    fetchDocument: documentOperations.fetchDocument,
    forceRefreshDocuments: documentOperations.forceRefreshDocuments,
    
    // From useContextManagement
    initializeContext: contextManagement.initializeContext,
    getDocumentsInContext: contextManagement.getDocumentsInContext,
    addDocumentToContext: contextManagement.addDocumentToContext,
    removeDocumentFromContext: contextManagement.removeDocumentFromContext,
    
    // Combine loading states
    isLoading: driveConnection.isLoading || documentOperations.isLoading || contextManagement.isLoading
  };
}
