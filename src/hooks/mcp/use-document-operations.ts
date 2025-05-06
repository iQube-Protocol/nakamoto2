
import { useState, useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { toast } from 'sonner';

/**
 * Hook for document operations
 */
export function useDocumentOperations(
  client: MCPClient | null, 
  driveConnected: boolean
) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      toast.error('Failed to list documents', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
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
      toast.error('Failed to fetch document', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected]);

  return {
    documents,
    isLoading,
    listDocuments,
    fetchDocument
  };
}
