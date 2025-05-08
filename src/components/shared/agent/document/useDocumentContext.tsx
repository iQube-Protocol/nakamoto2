
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
  
  // Get documents from context whenever the conversation ID changes or client becomes available
  useEffect(() => {
    const loadDocumentContext = async () => {
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
    };
    
    // Load document context immediately
    loadDocumentContext();
    
    // Set up a listener for context changes
    const handleContextUpdate = () => {
      if (client && conversationId) {
        loadDocumentContext();
      }
    };
    
    // Listen for document context updates
    window.addEventListener('documentContextUpdated', handleContextUpdate);
    
    // Also reload when tab becomes visible
    const handleTabVisibilityChange = () => {
      if (!document.hidden && client && conversationId) {
        loadDocumentContext();
      }
    };
    
    document.addEventListener('visibilitychange', handleTabVisibilityChange);
    
    // Clean up listeners
    return () => {
      window.removeEventListener('documentContextUpdated', handleContextUpdate);
      document.removeEventListener('visibilitychange', handleTabVisibilityChange);
    };
  }, [client, conversationId]);
  
  const handleDocumentSelect = async (document: any) => {
    if (!client) {
      toast.error('MCP client not initialized');
      return;
    }
    
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.error('Document already in context');
      return;
    }
    
    try {
      // Fetch document content
      const content = await fetchDocument(document.id);
      if (!content) {
        throw new Error('Failed to fetch document content');
      }
      
      // Add content to the document object for local tracking
      document.content = content;
      setSelectedDocuments(prev => [...prev, document]);
      
      // Make sure the document is added to the MCP context
      if (client && conversationId) {
        const documentType = document.mimeType.split('/').pop() || 'unknown';
        
        // Add to model context
        client.addDocumentToContext(
          document.id,
          document.name,
          documentType,
          content
        );
        
        console.log(`Document ${document.name} added to MCP context`);
        
        // Dispatch event that document context was updated
        const event = new CustomEvent('documentContextUpdated', { 
          detail: { documentId: document.id } 
        });
        window.dispatchEvent(event);
      }
      
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
    try {
      // Remove from the client context
      if (client && conversationId) {
        // Remove from MCP context first
        client.removeDocumentFromContext(documentId);
        console.log(`Document ${documentId} removed from MCP context`);
        
        // Dispatch event that document context was updated
        const event = new CustomEvent('documentContextUpdated', { 
          detail: { documentId, removed: true } 
        });
        window.dispatchEvent(event);
      }
      
      // Update local state
      setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document removed from context');
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
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
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument
  };
}
