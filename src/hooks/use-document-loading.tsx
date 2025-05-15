
import { useState, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';
import { RetryService } from '@/services/RetryService';

/**
 * Hook for handling document loading with robust error handling
 */
export function useDocumentLoading() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadedDocuments, setLoadedDocuments] = useState<string[]>([]);
  const { client: mcpClient, fetchDocument } = useMCP();
  
  const retryService = new RetryService({
    maxRetries: 3,
    baseDelay: 1000, 
    maxDelay: 6000
  });

  /**
   * Add a document to the context with improved error handling
   */
  const addDocumentToContext = useCallback(async (document: any, conversationId: string) => {
    if (!mcpClient) {
      console.error('MCP client not available');
      throw new Error('Document context service unavailable');
    }

    if (!conversationId) {
      console.error('No conversation ID available');
      throw new Error('No active conversation');
    }
    
    // Check if we've already loaded this document to avoid duplicate processing
    if (loadedDocuments.includes(document.id)) {
      console.log(`Document ${document.name} already processed, skipping`);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`Adding document ${document.name} to context for conversation ${conversationId}`);
      
      // Make sure context is initialized for this conversation
      await mcpClient.initializeContext(conversationId);
      
      // Check if document is already in context
      const context = mcpClient.getModelContext();
      if (context?.documentContext?.some(doc => doc.documentId === document.id)) {
        console.warn(`Document ${document.name} already in context`);
        toast.info('Document already in context');
        setLoadedDocuments(prev => [...prev, document.id]);
        return;
      }
      
      // Fetch document content with retry logic
      let content: string | null = null;
      if (document.content) {
        console.log(`Document ${document.name} already has content`);
        content = document.content;
      } else {
        console.log(`Fetching content for document ${document.name}`);
        
        // Use retry service for potentially transient failures
        content = await retryService.execute(async () => {
          try {
            const result = await fetchDocument(document.id);
            if (!result) {
              throw new Error('Failed to fetch document content');
            }
            return result;
          } catch (error) {
            console.error(`Error fetching document ${document.id}:`, error);
            throw error; // Allow retry service to handle it
          }
        });
      }
      
      if (!content) {
        throw new Error(`Could not get content for document ${document.name}`);
      }
      
      // Validate content
      if (content.length < 10) {
        throw new Error(`Document ${document.name} content is suspiciously short`);
      }
      
      // Add document to context
      mcpClient.addDocumentToContext(
        document.id, 
        document.name,
        document.mimeType || 'text/plain',
        content
      );
      
      // Add to loaded documents to prevent reprocessing
      setLoadedDocuments(prev => [...prev, document.id]);
      
      console.log(`Successfully added document ${document.name} to context`);
      toast.success(`Added ${document.name} to context`);
      
      return true;
    } catch (error) {
      console.error('Error adding document to context:', error);
      
      // Show appropriate error message based on error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('already in context')) {
        toast.info('Document already in context');
      } else if (errorMessage.includes('content is empty') || errorMessage.includes('suspiciously short')) {
        toast.error('Document has no usable content', {
          description: 'Please try a different document with text content'
        });
      } else {
        toast.error('Failed to add document to context', {
          description: errorMessage
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mcpClient, fetchDocument, loadedDocuments, retryService]);

  /**
   * Refresh the loaded documents list
   */
  const refreshDocuments = useCallback(() => {
    setLoadedDocuments([]);
  }, []);

  return {
    isLoading,
    addDocumentToContext,
    loadedDocuments,
    refreshDocuments
  };
}
