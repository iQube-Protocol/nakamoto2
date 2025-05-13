
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';

interface UseDocumentActionsProps {
  conversationId: string | null;
  selectedDocuments: any[];
  setSelectedDocuments: (docs: any[]) => void;
  onDocumentAdded?: () => void;
}

/**
 * Hook for document actions (add, remove)
 */
export function useDocumentActions({ 
  conversationId, 
  selectedDocuments, 
  setSelectedDocuments,
  onDocumentAdded 
}: UseDocumentActionsProps) {
  const { client, fetchDocument } = useMCP();

  const handleDocumentSelect = useCallback(async (document: any) => {
    if (!client) {
      toast.error('MCP client not initialized');
      return;
    }
    
    if (!conversationId) {
      toast.error('No active conversation');
      return;
    }
    
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.error('Document already in context');
      return;
    }
    
    try {
      console.log(`Adding document to context: ${document.name} (${document.id})`);
      
      // Initialize the context with the conversation ID
      await client.initializeContext(conversationId);
      
      // Fetch document content
      const content = await fetchDocument(document.id);
      if (!content) {
        throw new Error('Failed to fetch document content');
      }
      
      console.log(`Document content fetched, length: ${content.length}`);
      
      // Add content to the document object for local tracking
      document.content = content;
      setSelectedDocuments(prev => [...prev, document]);
      
      // Extract document type from mimeType
      const documentType = document.mimeType.split('/').pop() || 'unknown';
      
      // Add to model context
      console.log(`Adding document to MCP context: ${document.name}, type: ${documentType}`);
      client.addDocumentToContext(
        document.id,
        document.name,
        documentType,
        content
      );
      
      // Verify the document was added to context
      const updatedContext = client.getModelContext();
      const docInContext = updatedContext?.documentContext?.find(d => d.documentId === document.id);
      
      if (docInContext) {
        console.log(`Document successfully added to context. Content length: ${docInContext.content.length}`);
        
        // Double-check content
        if (docInContext.content.length === 0) {
          console.error("Document added but content is empty!");
          throw new Error("Document content is empty after adding to context");
        }
      } else {
        console.error("Document not found in context after adding!");
        throw new Error("Failed to add document to context");
      }
      
      // Dispatch event that document context was updated
      const event = new CustomEvent('documentContextUpdated', { 
        detail: { documentId: document.id, action: 'added' } 
      });
      window.dispatchEvent(event);
      
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
  }, [client, conversationId, fetchDocument, onDocumentAdded, selectedDocuments, setSelectedDocuments]);
  
  const handleRemoveDocument = useCallback((documentId: string) => {
    try {
      console.log(`Removing document from context: ${documentId}`);
      
      // Find the document name before removing it
      const documentToRemove = selectedDocuments.find(doc => doc.id === documentId);
      const documentName = documentToRemove?.name || documentId;
      
      // Remove from the client context
      if (client && conversationId) {
        // Remove from MCP context first
        const removed = client.removeDocumentFromContext(documentId);
        console.log(`Document ${documentId} removal from MCP context: ${removed ? 'successful' : 'failed'}`);
        
        // Verify document was removed
        const updatedContext = client.getModelContext();
        const stillInContext = updatedContext?.documentContext?.some(d => d.documentId === documentId);
        
        if (stillInContext) {
          console.warn(`Document ${documentName} still in context after removal attempt!`);
        } else {
          console.log(`Document ${documentName} successfully removed from context`);
        }
        
        // Dispatch event that document context was updated
        const event = new CustomEvent('documentContextUpdated', { 
          detail: { documentId, removed: true, action: 'removed' } 
        });
        window.dispatchEvent(event);
      }
      
      // Update local state
      setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success(`Document "${documentName}" removed from context`);
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  }, [client, conversationId, selectedDocuments, setSelectedDocuments]);

  return {
    handleDocumentSelect,
    handleRemoveDocument
  };
}
