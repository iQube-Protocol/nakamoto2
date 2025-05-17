
import { useCallback } from 'react';
import { toast } from 'sonner';
import { 
  addDocumentToContext, 
  removeDocumentFromContext,
  dispatchDocumentContextUpdated 
} from '../utils/documentOperations';

/**
 * Hook to handle document selection and removal operations
 */
export function useDocumentSelection({
  client,
  conversationId,
  fetchDocument,
  selectedDocuments,
  setSelectedDocuments,
  documentErrors,
  setDocumentErrors,
  onDocumentAdded
}: {
  client: any;
  conversationId: string | null;
  fetchDocument: (id: string) => Promise<string | null>;
  selectedDocuments: any[];
  setSelectedDocuments: (docs: any[] | ((prevDocs: any[]) => any[])) => void;
  documentErrors: Map<string, string>;
  setDocumentErrors: (errors: Map<string, string> | ((prevErrors: Map<string, string>) => Map<string, string>)) => void;
  onDocumentAdded?: () => void;
}) {
  // Handle document selection and addition to context
  const handleDocumentSelect = useCallback(async (document: any) => {
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.info('Document already in context');
      return document;
    }
    
    try {
      // Clear any previous error for this document
      const newErrors = new Map(documentErrors);
      newErrors.delete(document.id);
      setDocumentErrors(newErrors);
      
      // Add document to context
      const enrichedDocument = await addDocumentToContext(client, conversationId, document, fetchDocument);
      
      // Verify document content was properly added
      if (!enrichedDocument.content || enrichedDocument.content.length === 0) {
        throw new Error(`Failed to retrieve content for document ${document.name}`);
      }
      
      // Add to local state
      setSelectedDocuments(prevDocs => [...prevDocs, enrichedDocument]);
      
      // Dispatch event that document context was updated
      dispatchDocumentContextUpdated(document.id, 'added');
      
      if (onDocumentAdded) {
        onDocumentAdded();
      }
      
      toast.success('Document added to conversation context');
      return document;
    } catch (error) {
      console.error('Error handling document selection:', error);
      
      // Track the error
      const newErrors = new Map(documentErrors);
      newErrors.set(document.id, error instanceof Error ? error.message : 'Unknown error');
      setDocumentErrors(newErrors);
      
      toast.error('Failed to add document', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }, [client, conversationId, fetchDocument, selectedDocuments, onDocumentAdded, documentErrors]);
  
  // Handle document removal from context
  const handleRemoveDocument = useCallback((documentId: string) => {
    // Find the document name before removing it
    const documentToRemove = selectedDocuments.find(doc => doc.id === documentId);
    const documentName = documentToRemove?.name || documentId;
    
    if (documentToRemove) {
      try {
        // Remove from MCP context
        const removed = removeDocumentFromContext(client, conversationId, documentId, documentName);
        
        if (removed) {
          // Clear any errors related to this document
          const newErrors = new Map(documentErrors);
          newErrors.delete(documentId);
          setDocumentErrors(newErrors);
          
          // Update local state
          setSelectedDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
          
          // Dispatch event that document context was updated
          dispatchDocumentContextUpdated(documentId, 'removed');
        }
        
        return removed;
      } catch (error) {
        console.error(`Error removing document ${documentName}:`, error);
        toast.error('Error removing document', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
        return false;
      }
    }
    
    return false;
  }, [client, conversationId, selectedDocuments, documentErrors]);

  return {
    handleDocumentSelect,
    handleRemoveDocument
  };
}
