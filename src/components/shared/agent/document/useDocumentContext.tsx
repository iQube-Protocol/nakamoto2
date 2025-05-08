
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';

interface UseDocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
}

/**
 * Custom hook for managing document context
 */
export default function useDocumentContext({ conversationId, onDocumentAdded }: UseDocumentContextProps) {
  const { client, fetchDocument, isLoading } = useMCP();
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, name: string, mimeType: string} | null>(null);
  
  // Get documents from context whenever the conversation ID changes
  useEffect(() => {
    if (client && conversationId) {
      const context = client.getModelContext();
      console.log("Loading document context:", context);
      
      if (context?.documentContext) {
        const docs = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`,
          content: doc.content
        }));
        setSelectedDocuments(docs);
        console.log("Documents loaded:", docs.length);
      } else {
        console.log("No document context available");
      }
    }
  }, [client, conversationId]);
  
  const handleDocumentSelect = async (document: any) => {
    if (!client) {
      toast.error('MCP client not initialized');
      return;
    }
    
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      const error = new Error('Document already in context');
      error.message = 'Document already in context';
      throw error;
    }
    
    // Fetch document content
    const content = await fetchDocument(document.id);
    if (content) {
      // Add content to the document object for local tracking
      document.content = content;
      setSelectedDocuments(prev => [...prev, document]);
      
      if (onDocumentAdded) onDocumentAdded();
      return document;
    } else {
      throw new Error('Failed to fetch document content');
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    // Remove from the client context
    if (client && conversationId) {
      const context = client.getModelContext();
      if (context?.documentContext) {
        context.documentContext = context.documentContext.filter(
          doc => doc.documentId !== documentId
        );
        
        // Persist the updated context
        const key = `mcp-context-${conversationId}`;
        localStorage.setItem(key, JSON.stringify(context));
      }
    }
    
    // Update local state
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast.success('Document removed from context');
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
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument
  };
}
