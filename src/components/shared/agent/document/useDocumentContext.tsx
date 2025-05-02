
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';
import { DocumentContext } from '@/integrations/mcp/types';

interface UseDocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
  refreshTrigger?: number;
}

/**
 * Custom hook for managing document context
 */
export default function useDocumentContext({ 
  conversationId, 
  onDocumentAdded,
  refreshTrigger = 0
}: UseDocumentContextProps) {
  const { client, fetchDocument, isLoading } = useMCP();
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, name: string, mimeType: string} | null>(null);
  const [contextInitialized, setContextInitialized] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Force reload documents from MCP context
  const forceRefreshDocuments = useCallback(() => {
    if (!client || !conversationId) return;
    
    try {
      const context = client.getModelContext();
      console.log('Forcing document refresh, context available:', !!context);
      
      if (context?.documentContext && context.documentContext.length > 0) {
        console.log(`Found ${context.documentContext.length} documents in context after force refresh`);
        
        const docs = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`,
          content: doc.content
        }));
        
        console.log('Refreshed documents:', docs.map(d => d.name).join(', '));
        setSelectedDocuments(docs);
      } else if (context) {
        console.log('No documents in context after force refresh');
        setSelectedDocuments([]);
      }
    } catch (error) {
      console.error('Error during force refresh:', error);
    }
  }, [client, conversationId]);
  
  // Get documents from context when component mounts, conversationId changes, or refreshTrigger changes
  useEffect(() => {
    if (!client || !conversationId) {
      console.log('Skip loading documents: client or conversationId missing');
      return;
    }
    
    const loadDocumentsWithRetry = async () => {
      try {
        // Initialize context if needed with the current conversationId
        await client.initializeContext(conversationId);
        
        const context = client.getModelContext();
        console.log(`Loading documents for conversation ${conversationId}, context available:`, !!context);
        
        if (context?.documentContext && context.documentContext.length > 0) {
          console.log(`Found ${context.documentContext.length} documents in MCP context:`);
          context.documentContext.forEach((doc, idx) => {
            console.log(`Document ${idx+1}: ${doc.documentName} (${doc.documentId})`);
          });
          
          const docs = context.documentContext.map(doc => ({
            id: doc.documentId,
            name: doc.documentName,
            mimeType: `application/${doc.documentType}`,
            content: doc.content
          }));
          
          console.log('Setting selected documents:', docs.map(d => d.name).join(', '));
          setSelectedDocuments(docs);
        } else {
          console.log('No documents in context or empty context');
          setSelectedDocuments([]);
        }
      } catch (error) {
        console.error('Error loading document context:', error);
        
        // Retry with backoff if needed (up to 3 attempts)
        if (attemptCount < 3) {
          console.log(`Retrying document load (attempt ${attemptCount + 1})`);
          setAttemptCount(prev => prev + 1);
          setTimeout(() => {
            forceRefreshDocuments();
          }, 1000 * (attemptCount + 1));
        }
      } finally {
        setContextInitialized(true);
      }
    };
    
    loadDocumentsWithRetry();
  }, [client, conversationId, refreshTrigger, attemptCount, forceRefreshDocuments]);
  
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
      
      // Ensure context is initialized with the current conversationId
      if (!client.getConversationId() && conversationId) {
        await client.initializeContext(conversationId);
      }
      
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
        
        // Force client to persist context
        client.contextManager.persistContext();
        
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
    handleViewDocument,
    forceRefreshDocuments
  };
}
