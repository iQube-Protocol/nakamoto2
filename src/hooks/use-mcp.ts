
import { useState, useEffect, useCallback } from 'react';
import { MCPClient, getMCPClient } from '@/integrations/mcp/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export function useMCP() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Initialize MCP client
  useEffect(() => {
    if (user) {
      const mcpClient = getMCPClient({
        // Check for metisActive status from localStorage
        metisActive: localStorage.getItem('metisActive') === 'true'
      });
      
      setClient(mcpClient);
      setIsInitialized(true);
      
      // Check if we already have a connection to Google Drive
      const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
      setDriveConnected(hasConnection);
    }
  }, [user]);
  
  // Connect to Google Drive
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    setIsLoading(true);
    try {
      // Use provided credentials or default ones (in production, would get from env or user input)
      const success = await client.connectToDrive(
        clientId || 'google-client-id', 
        apiKey || 'google-api-key'
      );
      
      if (success) {
        localStorage.setItem('gdrive-connected', 'true');
        setDriveConnected(true);
      }
      
      return success;
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      toast.error('Failed to connect to Google Drive');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // List available documents
  const listDocuments = useCallback(async (folderId?: string) => {
    if (!client || !driveConnected) {
      toast.error('Not connected to Google Drive');
      return [];
    }
    
    setIsLoading(true);
    try {
      const docs = await client.listDocuments(folderId);
      setDocuments(docs);
      return docs;
    } catch (error) {
      console.error('Error listing documents:', error);
      toast.error('Failed to list documents');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected]);
  
  // Fetch a document's content
  const fetchDocument = useCallback(async (documentId: string) => {
    if (!client || !driveConnected) {
      toast.error('Not connected to Google Drive');
      return null;
    }
    
    setIsLoading(true);
    try {
      return await client.fetchDocumentContent(documentId);
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      toast.error('Failed to fetch document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected]);
  
  // Initialize or get context for a conversation
  const initializeContext = useCallback(async (conversationId?: string) => {
    if (!client) return null;
    
    try {
      return await client.initializeContext(conversationId);
    } catch (error) {
      console.error('Error initializing MCP context:', error);
      toast.error('Failed to initialize conversation context');
      return null;
    }
  }, [client]);
  
  return {
    client,
    isInitialized,
    driveConnected,
    documents,
    isLoading,
    connectToDrive,
    listDocuments,
    fetchDocument,
    initializeContext
  };
}
