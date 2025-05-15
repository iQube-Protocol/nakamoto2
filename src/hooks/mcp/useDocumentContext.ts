
import { useState, useCallback, useEffect } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { toast } from 'sonner';
import { RetryService } from '@/services/RetryService';

/**
 * Hook for handling document browsing and fetching functionality
 */
export function useDocumentContext(client: MCPClient | null, driveConnected: boolean) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const retryService = new RetryService({
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000
  });
  
  // List available documents with improved error handling
  const listDocuments = useCallback(async (folderId?: string) => {
    if (!client) {
      console.warn('Cannot list documents: MCP client not available');
      return [];
    }
    
    if (!driveConnected) {
      console.warn('Cannot list documents: Not connected to Google Drive');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use retry service for transient failures
      const docs = await retryService.execute(async () => {
        try {
          const result = await client.listDocuments(folderId);
          return result;
        } catch (error) {
          console.error('Error in document listing:', error);
          throw error; // Allow retry service to handle it
        }
      });
      
      setDocuments(docs);
      return docs;
    } catch (error) {
      const typedError = error as Error;
      console.error('Failed to list documents after retries:', typedError);
      setError(typedError);
      
      toast.error('Failed to list documents', {
        description: typedError.message || 'Unknown error occurred'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected, retryService]);
  
  // Fetch a document's content with enhanced error handling
  const fetchDocument = useCallback(async (documentId: string) => {
    if (!client) {
      console.warn('Cannot fetch document: MCP client not available');
      return null;
    }
    
    if (!driveConnected) {
      console.warn('Cannot fetch document: Not connected to Google Drive');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use retry service for transient failures
      const content = await retryService.execute(async () => {
        try {
          const result = await client.fetchDocumentContent(documentId);
          
          // Validate content
          if (!result || result.length === 0) {
            throw new Error('Document content is empty');
          }
          
          return result;
        } catch (error) {
          console.error(`Error fetching document ${documentId}:`, error);
          throw error; // Allow retry service to handle it
        }
      });
      
      console.log(`Successfully fetched document content, length: ${content?.length || 0}`);
      return content;
    } catch (error) {
      const typedError = error as Error;
      console.error(`Failed to fetch document ${documentId} after retries:`, typedError);
      setError(typedError);
      
      toast.error('Failed to fetch document', {
        description: typedError.message || 'Unknown error occurred'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected, retryService]);
  
  // Clear error state when dependencies change
  useEffect(() => {
    setError(null);
  }, [client, driveConnected]);
  
  return {
    documents,
    listDocuments,
    fetchDocument,
    isLoading,
    error
  };
}
