import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  addDocumentToContext, 
  removeDocumentFromContext,
  dispatchDocumentContextUpdated
} from '../utils/documentOperations';

interface UseDocumentActionsProps {
  client: any;
  conversationId: string | null;
  fetchDocument: (id: string) => Promise<string | null>;
  onDocumentAdded?: () => void;
  selectedDocuments: any[];
  setSelectedDocuments: (docs: any[] | ((prevDocs: any[]) => any[])) => void;
}

/**
 * Hook to handle document selection, removal, and viewing actions
 */
export function useDocumentActions({
  client,
  conversationId,
  fetchDocument,
  onDocumentAdded,
  selectedDocuments,
  setSelectedDocuments
}: UseDocumentActionsProps) {
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, name: string, mimeType: string} | null>(null);
  const [documentErrors, setDocumentErrors] = useState<Map<string, string>>(new Map());
  
  // Listen for document content recovery events
  useEffect(() => {
    const handleDocumentRecovery = async (event: CustomEvent) => {
      const { documentId, documentName } = event.detail;
      
      if (!selectedDocuments.some(doc => doc.id === documentId)) return;
      
      console.log(`Attempting to recover document: ${documentName}`);
      try {
        // Re-fetch the document content
        const content = await fetchDocument(documentId);
        
        if (content) {
          // Update local state - Fix this line to use function style state update
          setSelectedDocuments((prevDocs) => prevDocs.map(doc => {
            if (doc.id === documentId) {
              return { ...doc, content };
            }
            return doc;
          }));
          
          // Clear any error for this document
          const newErrors = new Map(documentErrors);
          newErrors.delete(documentId);
          setDocumentErrors(newErrors);
          
          console.log(`Successfully recovered content for document ${documentName}`);
          
          // Notify that document content was updated
          dispatchDocumentContextUpdated(documentId, 'updated');
        }
      } catch (error) {
        console.error(`Error recovering document ${documentName}:`, error);
        // Track the error
        const newErrors = new Map(documentErrors);
        newErrors.set(documentId, 'Failed to recover content');
        setDocumentErrors(newErrors);
      }
    };
    
    window.addEventListener('documentContentRecoveryNeeded', handleDocumentRecovery as EventListener);
    
    return () => {
      window.removeEventListener('documentContentRecoveryNeeded', handleDocumentRecovery as EventListener);
    };
  }, [selectedDocuments, setSelectedDocuments, fetchDocument, documentErrors]);
  
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
  
  // Handle document viewing
  const handleViewDocument = useCallback((document: any) => {
    setViewingDocument({
      id: document.id,
      name: document.name,
      content: document.content || "Content not available",
      mimeType: document.mimeType
    });
  }, []);
  
  // Attempt to recover a document's content
  const recoverDocumentContent = useCallback(async (documentId: string) => {
    const doc = selectedDocuments.find(d => d.id === documentId);
    if (!doc) return false;
    
    try {
      console.log(`Attempting to recover content for ${doc.name}`);
      const content = await fetchDocument(documentId);
      
      if (content && content.length > 0) {
        // Update local state - Fix this line to use function style state update
        setSelectedDocuments((prevDocs) => prevDocs.map(d => {
          if (d.id === documentId) {
            return { ...d, content };
          }
          return d;
        }));
        
        // Clear any error for this document
        const newErrors = new Map(documentErrors);
        newErrors.delete(documentId);
        setDocumentErrors(newErrors);
        
        // Add back to MCP context
        if (client && conversationId) {
          try {
            client.addDocumentToContext(
              documentId,
              doc.name,
              doc.mimeType.split('/').pop() || 'text',
              content
            );
          } catch (e) {
            console.error(`Error re-adding document to MCP context:`, e);
          }
        }
        
        // Notify that document was recovered
        dispatchDocumentContextUpdated(documentId, 'updated');
        toast.success(`Recovered document: "${doc.name}"`);
        return true;
      } else {
        throw new Error('Retrieved empty content');
      }
    } catch (error) {
      console.error(`Error recovering document ${doc.name}:`, error);
      toast.error(`Failed to recover document: "${doc.name}"`, {
        description: 'Unable to retrieve document content'
      });
      return false;
    }
  }, [selectedDocuments, fetchDocument, client, conversationId, documentErrors]);

  return {
    viewingDocument,
    setViewingDocument,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    documentErrors,
    recoverDocumentContent
  };
}
