
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';
import { DocumentContext } from '@/integrations/mcp/types';

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
  
  // Get documents from context - run on mount and when conversationId or client changes
  useEffect(() => {
    const loadDocuments = async () => {
      if (!client || !conversationId) return;
      
      try {
        const context = client.getModelContext();
        if (context?.documentContext && context.documentContext.length > 0) {
          console.log('Documents in context:', context.documentContext.length);
          
          const docs = context.documentContext.map(doc => ({
            id: doc.documentId,
            name: doc.documentName,
            mimeType: `application/${doc.documentType}`,
            content: doc.content
          }));
          
          console.log('Setting selected documents:', docs.length, 
            docs.map(d => d.name).join(', '));
          setSelectedDocuments(docs);
        } else {
          console.log('No documents in context or empty context');
          setSelectedDocuments([]);
        }
      } catch (error) {
        console.error('Error loading document context:', error);
      } finally {
        setContextInitialized(true);
      }
    };
    
    loadDocuments();
  }, [client, conversationId]);
  
  // Refresh document list when context changes
  useEffect(() => {
    if (contextInitialized && client && conversationId) {
      const context = client.getModelContext();
      if (context?.documentContext) {
        const newDocsList = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`,
          content: doc.content
        }));
        
        // Only update if there's a difference to avoid infinite loops
        const currentIds = selectedDocuments.map(doc => doc.id).sort().join(',');
        const newIds = newDocsList.map(doc => doc.id).sort().join(',');
        
        if (currentIds !== newIds) {
          console.log('Document context changed, updating UI');
          setSelectedDocuments(newDocsList);
        }
      }
    }
  }, [contextInitialized, client, conversationId, selectedDocuments]);
  
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
        
        // Debug for verification
        console.log('Document added to context:', document.name);
        const updatedContext = client.getModelContext();
        if (updatedContext?.documentContext) {
          console.log('Current document context count:', updatedContext.documentContext.length);
        }
        
        // Notify parent component
        if (onDocumentAdded) onDocumentAdded();
      } else {
        toast.error('Failed to initialize document context');
      }
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    if (!client || !conversationId) {
      toast.error('MCP client not initialized');
      return;
    }
    
    // Remove from the client context
    const context = client.getModelContext();
    if (context?.documentContext) {
      // Update the context in MCP client
      context.documentContext = context.documentContext.filter(
        doc => doc.documentId !== documentId
      );
      
      // Force client to save the updated context
      client.contextManager.persistContext();
      console.log('Document removed from context, remaining:', context.documentContext.length);
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
