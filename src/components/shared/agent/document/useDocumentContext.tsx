
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';
import { DocumentContext as DocumentContextType } from '@/integrations/mcp/types';

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
  
  // Force reload documents from MCP context - improved implementation
  const forceRefreshDocuments = useCallback(() => {
    if (!client || !conversationId) {
      console.log('Skip refresh: client or conversationId missing');
      return;
    }
    
    try {
      console.log(`Force refreshing documents for conversation ${conversationId}`);
      
      // Force client to reinitialize context with current conversationId
      client.initializeContext(conversationId).then(() => {
        // Now get the model context which should have fresh document data
        const context = client.getModelContext();
        console.log('Context after re-initialization:', 
          context ? `Found with ${context.documentContext?.length || 0} documents` : 'Not available');
        
        if (context?.documentContext && context.documentContext.length > 0) {
          // Map documents from context to local format
          const docs = context.documentContext.map(doc => ({
            id: doc.documentId,
            name: doc.documentName,
            mimeType: `application/${doc.documentType}`,
            content: doc.content
          }));
          
          console.log('Refreshed documents:', docs.map(d => d.name).join(', '));
          setSelectedDocuments(docs);
          
          // Force client to persist context to ensure it's saved
          client.persistContext();
        } else if (context) {
          console.log('No documents in context after force refresh');
          setSelectedDocuments([]);
        }
      });
    } catch (error) {
      console.error('Error during force refresh:', error);
      toast.error('Failed to refresh documents');
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
        console.log(`Loading documents for conversation ${conversationId}`);
        // Initialize context with the current conversationId
        await client.initializeContext(conversationId);
        
        // Get fresh context after initialization
        const context = client.getModelContext();
        console.log(`Context loaded, available:`, !!context);
        
        if (context?.documentContext && context.documentContext.length > 0) {
          console.log(`Found ${context.documentContext.length} documents in MCP context`);
          
          const docs = context.documentContext.map(doc => ({
            id: doc.documentId,
            name: doc.documentName,
            mimeType: `application/${doc.documentType}`,
            content: doc.content || ''
          }));
          
          console.log('Setting selected documents:', docs.map(d => d.name).join(', '));
          setSelectedDocuments(docs);
          setContextInitialized(true);
        } else {
          console.log('No documents in context or empty context');
          setSelectedDocuments([]);
          setContextInitialized(true);
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
    
    toast.loading("Adding document to context...", { id: "adding-doc" });
    
    try {
      // Fetch document content
      const content = await fetchDocument(document.id);
      if (!content) {
        toast.error('Failed to fetch document content');
        return;
      }
      
      // Add content to the document object for local tracking
      document.content = content;
      
      // Ensure context is initialized with the current conversationId
      if (!conversationId) {
        toast.error('No active conversation');
        return;
      }
      
      // Initialize context with current conversation ID
      await client.initializeContext(conversationId);
      
      // Create document context object
      const docContext: DocumentContextType = {
        documentId: document.id,
        documentName: document.name,
        documentType: document.mimeType.split('/')[1] || 'text',
        content: content,
        lastModified: new Date().toISOString()
      };
      
      // Add document to context
      client.contextManager.addDocumentToContext(docContext);
      
      // Force persist
      client.persistContext();
      
      // Update local state
      setSelectedDocuments(prev => [...prev, document]);
      
      // Success notification
      toast.success('Document added to context', { id: "adding-doc" });
      
      // Debug for verification
      console.log('Document added to context:', document.name);
      const updatedContext = client.getModelContext();
      if (updatedContext?.documentContext) {
        console.log('Current document context count:', updatedContext.documentContext.length);
      }
      
      // Notify parent component
      if (onDocumentAdded) onDocumentAdded();
      
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document', { id: "adding-doc" });
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    if (!client || !conversationId) {
      toast.error('MCP client not initialized');
      return;
    }
    
    try {
      // Remove from the client context
      const context = client.getModelContext();
      if (context?.documentContext) {
        // Update the context in MCP client
        context.documentContext = context.documentContext.filter(
          doc => doc.documentId !== documentId
        );
        
        // Force client to save the updated context
        client.persistContext();
        console.log('Document removed from context, remaining:', context.documentContext.length);
        
        // Update local state
        setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document removed from context');
      }
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
    handleViewDocument,
    forceRefreshDocuments
  };
}
