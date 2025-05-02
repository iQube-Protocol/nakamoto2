
import { useState, useEffect, useCallback } from 'react';
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
  const [loadedConversationId, setLoadedConversationId] = useState<string | null>(null);
  
  // Get documents from context when conversation ID changes or client initializes
  useEffect(() => {
    const loadDocuments = async () => {
      if (client && conversationId && conversationId !== loadedConversationId) {
        console.log(`Loading documents for conversation: ${conversationId}`);
        
        // Initialize context for the current conversation to ensure it's loaded
        await client.initializeContext(conversationId);
        
        // Get the context after initialization
        const context = client.getModelContext();
        if (context?.documentContext) {
          const docs = context.documentContext.map(doc => ({
            id: doc.documentId,
            name: doc.documentName,
            mimeType: `application/${doc.documentType}`,
            content: doc.content
          }));
          
          console.log(`Found ${docs.length} documents in context for conversation: ${conversationId}`);
          setSelectedDocuments(docs);
          setLoadedConversationId(conversationId);
        } else {
          console.log(`No documents found in context for conversation: ${conversationId}`);
          setSelectedDocuments([]);
          setLoadedConversationId(conversationId);
        }
      }
    };
    
    loadDocuments();
  }, [client, conversationId, loadedConversationId]);
  
  const handleDocumentSelect = async (document: any) => {
    if (!client) {
      toast.error('MCP client not initialized', { duration: 3000 });
      return;
    }
    
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.info('Document already in context', { duration: 2000 });
      return;
    }
    
    // Make sure we have a conversation context initialized
    if (!conversationId) {
      const newConversationId = await client.initializeContext();
      console.log(`Created new conversation with ID: ${newConversationId}`);
      setLoadedConversationId(newConversationId);
    }
    
    // Fetch document content
    const content = await fetchDocument(document.id);
    if (content) {
      // Extract document type from mimeType
      const documentType = document.mimeType.split('/')[1] || 'plain';
      
      // Add to MCP context
      if (client) {
        client.addDocumentToContext(
          document.id, 
          document.name, 
          documentType, 
          content
        );
        
        // Force persist context to ensure it's saved
        client.persistContext();
        
        // Add content to the document object for local tracking
        document.content = content;
        setSelectedDocuments(prev => [...prev, document]);
        toast.success('Document added to context', { duration: 2000 });
        
        // Call callback if provided
        if (onDocumentAdded) onDocumentAdded();
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
        
        // Force persist context to storage
        client.persistContext();
        console.log(`Removed document ${documentId} from context`);
      }
    }
    
    // Update local state
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast.success('Document removed from context', { duration: 2000 });
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
