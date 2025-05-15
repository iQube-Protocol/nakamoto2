import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { addDocumentToContext, removeDocumentFromContext } from '../utils/documentOperations';
import { dispatchDocumentAdded, dispatchDocumentRemoved } from './useDocumentEvents';
import { MCPClient } from '@/integrations/mcp/client';

interface UseDocumentActionsProps {
  client: MCPClient | null;
  conversationId: string | null;
  fetchDocument: (documentId: string) => Promise<string | null>;
  onDocumentAdded?: () => void;
  selectedDocuments: any[];
  setSelectedDocuments: React.Dispatch<React.SetStateAction<any[]>>;
}

/**
 * Hook for document action operations
 */
export const useDocumentActions = ({
  client,
  conversationId,
  fetchDocument,
  onDocumentAdded,
  selectedDocuments,
  setSelectedDocuments
}: UseDocumentActionsProps) => {
  const [viewingDocument, setViewingDocument] = useState<any>(null);
  
  // Handle document selection to add to context
  const handleDocumentSelect = useCallback(async (document: any) => {
    if (!client || !conversationId) {
      toast.error('Cannot add document', {
        description: 'MCP client or conversation ID not available'
      });
      throw new Error('MCP client or conversation ID not available');
    }
    
    try {
      const isFolder = document.mimeType.includes('folder');
      
      if (isFolder) {
        toast.error('Cannot add folders', {
          description: 'Only documents can be added to the conversation context'
        });
        throw new Error('Cannot add folders to context');
      }
      
      // Check if document is already in the context
      const isAlreadyAdded = selectedDocuments.some(doc => doc.id === document.id);
      if (isAlreadyAdded) {
        toast.info('Document already added');
        throw new Error('Document already in context');
      }
      
      // Add document to context
      const added = await addDocumentToContext(client, conversationId, document);
      
      if (added) {
        // Update selected documents list
        setSelectedDocuments(prev => [
          ...prev,
          {
            ...document,
            inContext: true
          }
        ]);
        
        toast.success('Document added to context');
        
        // Trigger events
        dispatchDocumentAdded(document.id);
        if (onDocumentAdded) onDocumentAdded();
      }
      
      return document;
    } catch (error) {
      console.error('Error selecting document:', error);
      throw error;
    }
  }, [client, conversationId, selectedDocuments, setSelectedDocuments, onDocumentAdded]);
  
  // Handle document removal from context
  const handleRemoveDocument = useCallback((documentId: string) => {
    if (!client) {
      toast.error('Cannot remove document', {
        description: 'MCP client not available'
      });
      return;
    }
    
    const removed = removeDocumentFromContext(client, documentId);
    
    if (removed) {
      setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document removed from context');
      
      // Trigger events
      dispatchDocumentRemoved(documentId);
    } else {
      toast.error('Failed to remove document');
    }
  }, [client, setSelectedDocuments]);
  
  // Handle viewing document content
  const handleViewDocument = useCallback(async (document: any) => {
    if (!document) return;
    
    try {
      // If document already has content, use it
      if (document.content) {
        setViewingDocument({
          ...document,
          content: document.content
        });
        return;
      }
      
      // Otherwise fetch content
      const content = await fetchDocument(document.id);
      
      if (content) {
        setViewingDocument({
          ...document,
          content
        });
      } else {
        toast.error('Failed to load document content');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to load document', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [fetchDocument]);
  
  return {
    viewingDocument,
    setViewingDocument,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument
  };
};
