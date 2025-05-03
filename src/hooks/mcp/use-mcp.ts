
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MCPClient, getMCPClient } from '@/integrations/mcp/client';

/**
 * Main hook combining all MCP functionality
 */
export function useMCP() {
  const { user } = useAuth();
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiLoadError, setApiLoadError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [documents, setDocuments] = useState<any[]>([]);
  
  // Initialize client on first load
  useEffect(() => {
    // Check if we already have a connection to Google Drive
    const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
    
    const mcpClient = getMCPClient({
      // Check for metisActive status from localStorage
      metisActive: localStorage.getItem('metisActive') === 'true',
      debug: true, // Enable debug mode
      apiLoadTimeout: 30000, // 30-second timeout
      onApiLoadStart: () => {
        console.log('MCP API loading started');
        setIsApiLoading(true);
      },
      onApiLoadComplete: () => {
        console.log('MCP API loading completed');
        setIsApiLoading(false);
      }
    });
    
    setClient(mcpClient);
    setIsInitialized(true);
    setDriveConnected(hasConnection);
    setConnectionStatus(hasConnection ? 'connected' : 'disconnected');
  }, []);
  
  // Connect to Google Drive
  const connectToDrive = async (clientId: string, apiKey: string): Promise<boolean> => {
    if (!client) return false;
    
    try {
      setIsLoading(true);
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      const result = await client.connectToDrive(clientId, apiKey, cachedToken);
      
      // Save connection state
      setDriveConnected(result);
      setConnectionStatus(result ? 'connected' : 'error');
      
      if (result) {
        localStorage.setItem('gdrive-connected', 'true');
        console.log('Successfully connected to Google Drive');
      } else {
        localStorage.removeItem('gdrive-connected');
        console.error('Failed to connect to Google Drive');
      }
      
      return result;
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      setConnectionStatus('error');
      setApiLoadError(error instanceof Error ? error : new Error('Unknown error connecting to Drive'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset Google Drive connection
  const resetDriveConnection = () => {
    localStorage.removeItem('gdrive-connected');
    localStorage.removeItem('gdrive-auth-token');
    
    if (client) {
      client.resetDriveConnection();
    }
    
    setDriveConnected(false);
    setConnectionStatus('disconnected');
    console.log('Drive connection reset');
  };
  
  // List documents from Google Drive
  const listDocuments = async (folderId?: string) => {
    if (!client || !driveConnected) {
      console.warn('Cannot list documents: Client not initialized or not connected to Drive');
      return [];
    }
    
    try {
      setIsLoading(true);
      const fetchedDocuments = await client.listDocuments(folderId);
      setDocuments(fetchedDocuments); // Store documents in local state
      return fetchedDocuments;
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch document content
  const fetchDocument = async (documentId: string) => {
    if (!client || !driveConnected) {
      console.warn('Cannot fetch document: Client not initialized or not connected to Drive');
      return null;
    }
    
    try {
      setIsLoading(true);
      return await client.fetchDocumentContent(documentId);
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force refresh documents
  const forceRefreshDocuments = async (folderId?: string) => {
    return listDocuments(folderId);
  };
  
  // Check API status
  const checkApiStatus = (): boolean => {
    return client?.isApiLoaded() || false;
  };
  
  // Get connection status
  const getConnectionStatus = (): 'disconnected' | 'connecting' | 'connected' | 'error' => {
    if (!client) return 'disconnected';
    return client.getConnectionStatus();
  };
  
  // Initialize or retrieve context
  const initializeContext = async (existingConversationId?: string): Promise<string> => {
    if (!client) throw new Error('Client not initialized');
    return client.initializeContext(existingConversationId);
  };
  
  // Add document to context
  const addDocumentToContext = async (conversationId: string, document: any, documentType?: string, content?: string): Promise<boolean> => {
    if (!client) return false;
    return client.addDocumentToContext(conversationId, document, documentType, content);
  };
  
  // Remove document from context
  const removeDocumentFromContext = async (conversationId: string, documentId: string): Promise<boolean> => {
    if (!client) return false;
    return client.removeDocumentFromContext(conversationId, documentId);
  };
  
  // Get documents in context
  const getDocumentsInContext = async (conversationId?: string): Promise<any[]> => {
    if (!client) return [];
    return client.getDocumentsInContext(conversationId);
  };

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
    documents, // Explicitly expose documents
  };
}
