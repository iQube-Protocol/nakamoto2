
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from './use-mcp';
import { documentValidationService } from '@/services/DocumentValidationService';

/**
 * Custom hook for document loading with enhanced error handling
 */
export function useDocumentLoading() {
  const { client } = useMCP();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(null);
  
  /**
   * Fetch and validate document content
   */
  const fetchDocumentContent = useCallback(async (documentId: string) => {
    if (!client) {
      toast.error('Document service unavailable');
      return null;
    }
    
    setIsLoading(true);
    setLoadingDocumentId(documentId);
    
    try {
      console.log(`Fetching document content for ${documentId}`);
      const content = await client.fetchDocumentContent(documentId);
      
      if (!content) {
        throw new Error('Failed to fetch document content (empty)');
      }
      
      // Log content summary
      console.log(`Document content fetched, length: ${content.length}`);
      console.log(`Content preview: ${content.substring(0, 100)}...`);
      
      return content;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
      setLoadingDocumentId(null);
    }
  }, [client]);
  
  /**
   * Add document to conversation context with robust error handling
   */
  const addDocumentToContext = useCallback(async (
    document: any,
    conversationId: string | null
  ) => {
    if (!client) {
      toast.error('Document service unavailable');
      return null;
    }
    
    if (!conversationId) {
      toast.error('No active conversation');
      return null;
    }
    
    setIsLoading(true);
    setLoadingDocumentId(document.id);
    
    try {
      console.log(`Adding document to context: ${document.name} (${document.id})`);
      
      // Initialize context
      await client.initializeContext(conversationId);
      
      // Check if document is already in context
      const currentContext = client.getModelContext();
      const existingDoc = currentContext?.documentContext?.find(
        doc => doc.documentId === document.id
      );
      
      if (existingDoc) {
        console.log(`Document ${document.name} is already in context`);
        if (existingDoc.content && existingDoc.content.length > 0) {
          toast.info('Document already added to context');
          return document;
        } else {
          console.log(`Existing document has empty content, will fetch again`);
        }
      }
      
      // Fetch document content
      const content = await fetchDocumentContent(document.id);
      
      if (!content) {
        throw new Error('Failed to fetch document content');
      }
      
      // Validate content
      const documentType = document.mimeType.split('/').pop() || 'unknown';
      const validation = documentValidationService.validateContent(
        content,
        document.name,
        document.mimeType
      );
      
      if (!validation.isValid && !validation.content) {
        throw new Error(validation.message);
      }
      
      // Add validated content to context
      client.addDocumentToContext(
        document.id,
        document.name,
        documentType,
        validation.content || content
      );
      
      // Verify document was added
      const updatedContext = client.getModelContext();
      const addedDoc = updatedContext?.documentContext?.find(
        doc => doc.documentId === document.id
      );
      
      if (!addedDoc) {
        throw new Error('Failed to add document to context');
      }
      
      if (!addedDoc.content || addedDoc.content.length === 0) {
        throw new Error('Document added with empty content');
      }
      
      toast.success(`Document "${document.name}" added to context`);
      
      // Return document with content
      return {
        ...document,
        content
      };
    } catch (error) {
      console.error('Error adding document to context:', error);
      
      // More detailed error messages
      if (error.toString().includes('already in context')) {
        toast.info('Document already in context');
      } else {
        toast.error('Failed to add document to context', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      setLoadingDocumentId(null);
    }
  }, [client, fetchDocumentContent]);
  
  return {
    isLoading,
    loadingDocumentId,
    fetchDocumentContent,
    addDocumentToContext
  };
}
