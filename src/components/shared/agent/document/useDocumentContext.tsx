
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
  const [contextInitialized, setContextInitialized] = useState(false);
  
  // Get documents from context
  useEffect(() => {
    if (client && conversationId) {
      const context = client.getModelContext();
      if (context?.documentContext) {
        console.log('Documents in context:', context.documentContext.length);
        const docs = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`,
          content: doc.content
        }));
        setSelectedDocuments(docs);
        setContextInitialized(true);
      } else if (!contextInitialized) {
        console.log('No documents in context or context not initialized');
      }
    }
  }, [client, conversationId, contextInitialized]);
  
  const handleDocumentSelect = async (document: any) => {
    if (!client) {
      toast.error('MCP client not initialized');
      return;
    }
    
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.info('Document already in context');
      return;
    }
    
    // Fetch document content
    const content = await fetchDocument(document.id);
    if (content) {
      // Add content to the document object for local tracking
      document.content = content;
      
      // Ensure context manager exists in the MCP client
      const context = client.getModelContext();
      if (context) {
        // Add document to MCP context via the contextManager
        client.contextManager.addDocumentToContext({
          documentId: document.id,
          documentName: document.name,
          documentType: document.mimeType.split('/')[1] || 'text',
          content: content
        });
        
        // Update local state
        setSelectedDocuments(prev => [...prev, document]);
        toast.success('Document added to context');
        
        // Notify parent component
        if (onDocumentAdded) onDocumentAdded();
      } else {
        toast.error('Failed to initialize document context');
      }
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
