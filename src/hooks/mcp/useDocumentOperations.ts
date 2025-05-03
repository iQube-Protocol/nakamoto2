
import { useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Hook for document-related operations
 */
export function useDocumentOperations(
  client: MCPClient | null,
  driveConnected: boolean,
  setDriveConnected: (state: boolean) => void,
  setIsLoading: (state: boolean) => void,
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void,
  setDocuments: (documents: any[]) => void
) {
  // Connect to Google Drive
  const connectToDrive = useCallback(async (clientId: string, apiKey: string): Promise<boolean> => {
    if (!client) {
      console.error("Cannot connect to Drive: MCP client is not initialized");
      return false;
    }
    
    try {
      setIsLoading(true);
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      console.log("MCP: Connecting to drive with credentials", { 
        clientIdLength: clientId?.length, 
        apiKeyLength: apiKey?.length,
        hasCachedToken: !!cachedToken
      });
      
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
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client, setDriveConnected, setConnectionStatus, setIsLoading]);
  
  // Reset Google Drive connection
  const resetDriveConnection = useCallback(() => {
    localStorage.removeItem('gdrive-connected');
    localStorage.removeItem('gdrive-auth-token');
    
    if (client) {
      client.resetDriveConnection();
    }
    
    setDriveConnected(false);
    setConnectionStatus('disconnected');
    console.log('Drive connection reset');
  }, [client, setDriveConnected, setConnectionStatus]);
  
  // List documents from Google Drive
  const listDocuments = useCallback(async (folderId?: string) => {
    if (!client || !driveConnected) {
      console.warn('Cannot list documents: Client not initialized or not connected to Drive');
      return [];
    }
    
    try {
      setIsLoading(true);
      console.log("MCP: Listing documents for folder:", folderId || 'root');
      const fetchedDocuments = await client.listDocuments(folderId);
      setDocuments(fetchedDocuments); // Store documents in local state
      return fetchedDocuments;
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected, setDocuments, setIsLoading]);
  
  // Fetch document content
  const fetchDocument = useCallback(async (documentId: string) => {
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
  }, [client, driveConnected, setIsLoading]);
  
  // Force refresh documents
  const forceRefreshDocuments = useCallback(async (folderId?: string): Promise<any[]> => {
    return listDocuments(folderId);
  }, [listDocuments]);

  return {
    connectToDrive,
    resetDriveConnection,
    listDocuments,
    fetchDocument,
    forceRefreshDocuments
  };
}
