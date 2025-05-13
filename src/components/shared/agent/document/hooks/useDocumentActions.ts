
import { useState } from 'react';
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
  setSelectedDocuments: (docs: any[]) => void;
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
  
  const handleDocumentSelect = async (document: any) => {
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.error('Document already in context');
      return;
    }
    
    try {
      // Add document to context
      const enrichedDocument = await addDocumentToContext(client, conversationId, document, fetchDocument);
      
      // Add content to the document object for local tracking
      // Fix: Instead of using a function that returns an array, directly set the new array
      const updatedDocuments = [...selectedDocuments, enrichedDocument];
      setSelectedDocuments(updatedDocuments);
      
      // Dispatch event that document context was updated
      dispatchDocumentContextUpdated(document.id, 'added');
      
      if (onDocumentAdded) {
        onDocumentAdded();
      }
      
      toast.success('Document added to conversation context');
      return document;
    } catch (error) {
      console.error('Error handling document selection:', error);
      toast.error('Failed to add document', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    // Find the document name before removing it
    const documentToRemove = selectedDocuments.find(doc => doc.id === documentId);
    const documentName = documentToRemove?.name || documentId;
    
    const removed = removeDocumentFromContext(client, conversationId, documentId, documentName);
    
    if (removed) {
      // Update local state
      // Fix: Instead of using a function that returns an array, directly set the new array
      const filteredDocuments = selectedDocuments.filter(doc => doc.id !== documentId);
      setSelectedDocuments(filteredDocuments);
      
      // Dispatch event that document context was updated
      dispatchDocumentContextUpdated(documentId, 'removed');
    }
  };
  
  const handleViewDocument = (document: any) => {
    setViewingDocument({
      id: document.id,
      name: document.name,
      content: document.content || "Content not available",
      mimeType: document.mimeType
    });
  };

  return {
    viewingDocument,
    setViewingDocument,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument
  };
}
