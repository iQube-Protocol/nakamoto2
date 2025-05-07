
import { useState } from 'react';
import { useConnectionInitialization } from './useConnectionInitialization';
import { useConnectionVerification } from './useConnectionVerification';
import { useApiStateTracking } from './useApiStateTracking';
import { useStatusCheck } from './useStatusCheck';
import { useDocumentOperations } from './useDocumentOperations';
import { useContextManagement } from './useContextManagement';
import { MCPClient } from '@/integrations/mcp/client';
import { MCPContext } from '@/integrations/mcp/types';

/**
 * Main hook combining all MCP functionality
 */
export function useMCP(): MCPContext {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [documents, setDocuments] = useState<any[]>([]);

  // Initialize the client and track API loading state
  const { isApiLoading, apiLoadError, setIsApiLoading } = useApiStateTracking(client);

  // Initialize MCP client and connection state
  useConnectionInitialization(
    setClient,
    setIsInitialized,
    setDriveConnected,
    setConnectionStatus,
    setIsApiLoading
  );

  // Verify connection state periodically
  useConnectionVerification(
    client,
    driveConnected,
    setDriveConnected,
    setConnectionStatus
  );

  // Get functions to check connection status
  const { getConnectionStatus, checkApiStatus } = useStatusCheck(
    client,
    driveConnected
  );

  // Drive operations
  const {
    connectToDrive,
    resetDriveConnection,
    listDocuments,
    fetchDocument,
    forceRefreshDocuments
  } = useDocumentOperations(
    client,
    driveConnected,
    setDriveConnected,
    setIsLoading,
    setConnectionStatus,
    setDocuments
  );

  // Context operations
  const {
    initializeContext,
    getDocumentsInContext,
    addDocumentToContext,
    removeDocumentFromContext
  } = useContextManagement(client);

  return {
    client,
    isInitialized,
    driveConnected,
    isLoading,
    isApiLoading,
    apiLoadError,
    connectionStatus,
    getConnectionStatus,
    connectToDrive,
    resetDriveConnection,
    checkApiStatus,
    listDocuments,
    fetchDocument,
    forceRefreshDocuments,
    initializeContext,
    getDocumentsInContext,
    addDocumentToContext,
    removeDocumentFromContext,
    documents,
  };
}
