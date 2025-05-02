
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
  const [documentCache, setDocumentCache] = useState<Record<string, any[]>>({});
  
  // Get documents from context when conversation ID changes or client initializes
  useEffect(() => {
    const loadDocuments = async () => {
      if (!client || !conversationId) return;
      
      // Check if this conversation's documents are already in our cache
      if (documentCache[conversationId]) {
        console.log(`Using cached documents for conversation: ${conversationId}`);
        setSelectedDocuments(documentCache[conversationId]);
        setLoadedConversationId(conversationId);
        return;
      }
      
      // If not cached, we need to load it
      console.log(`Loading documents for conversation: ${conversationId}`);
      
      try {
        // Initialize context for the current conversation to ensure it's loaded
        await client.initializeContext(conversationId);
        
        // Get the context after initialization
        const context = client.getModelContext();
        if (context?.documentContext && context.documentContext.length > 0) {
          const docs = context.documentContext.map(doc => ({
            id: doc.documentId,
            name: doc.documentName,
            mimeType: `application/${doc.documentType}`,
            content: doc.content
          }));
          
          console.log(`Found ${docs.length} documents in context for conversation: ${conversationId}`);
          setSelectedDocuments(docs);
          
          // Cache the documents for this conversation
          setDocumentCache(prev => ({
            ...prev,
            [conversationId]: docs
          }));
          
          setLoadedConversationId(conversationId);
        } else {
          console.log(`No documents found in context for conversation: ${conversationId}`);
          setSelectedDocuments([]);
          
          // Cache empty array for this conversation
          setDocumentCache(prev => ({
            ...prev,
            [conversationId]: []
          }));
          
          setLoadedConversationId(conversationId);
        }
      } catch (error) {
        console.error(`Error loading documents for conversation ${conversationId}:`, error);
        toast.error('Failed to load document context', {
          description: 'Please try refreshing the page',
          duration: 3000,
          id: 'doc-context-error',
        });
        
        // We still want to set the loaded ID to prevent repeated failed attempts
        setLoadedConversationId(conversationId);
      }
    };
    
    loadDocuments();
  }, [client, conversationId, documentCache]);
  
  const handleDocumentSelect = async (document: any) => {
    if (!client) {
      toast.error('MCP client not initialized', { 
        duration: 3000,
        id: 'doc-select-error',
      });
      return;
    }
    
    // Check if document is already in context
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      toast.info('Document already in context', { 
        duration: 2000,
        id: 'doc-info',
      });
      return;
    }
    
    // Make sure we have a conversation context initialized
    let targetConversationId = conversationId;
    if (!targetConversationId) {
      try {
        targetConversationId = await client.initializeContext();
        console.log(`Created new conversation with ID: ${targetConversationId}`);
        setLoadedConversationId(targetConversationId);
      } catch (error) {
        console.error('Failed to initialize conversation context:', error);
        toast.error('Failed to initialize context', {
          duration: 3000,
          id: 'doc-context-error',
        });
        return;
      }
    }
    
    // Show loading toast with ID to allow dismissing later
    toast.loading('Fetching document...', { 
      id: `doc-loading-${document.id}`,
      duration: 10000, // Prevent persistence
    });
    
    // Fetch document content
    const content = await fetchDocument(document.id);
    
    // Dismiss loading toast
    toast.dismiss(`doc-loading-${document.id}`);
    
    if (content) {
      try {
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
          const newDocument = { ...document, content };
          setSelectedDocuments(prev => [...prev, newDocument]);
          
          // Update the cache
          if (targetConversationId) {
            setDocumentCache(prev => ({
              ...prev,
              [targetConversationId]: [...prev[targetConversationId] || [], newDocument]
            }));
          }
          
          toast.success('Document added to context', { 
            duration: 2000,
            id: 'doc-added',
          });
          
          // Call callback if provided
          if (onDocumentAdded) onDocumentAdded();
        }
      } catch (error) {
        console.error('Error adding document to context:', error);
        toast.error('Failed to add document to context', {
          duration: 3000,
          id: 'doc-add-error',
        });
      }
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    if (!client || !conversationId) {
      toast.error('Cannot remove document - no active conversation', { 
        duration: 2000,
        id: 'doc-remove-error',
      });
      return;
    }
    
    try {
      // Remove from the client context
      const context = client.getModelContext();
      if (context?.documentContext) {
        context.documentContext = context.documentContext.filter(
          doc => doc.documentId !== documentId
        );
        
        // Force persist context to storage
        client.persistContext();
        console.log(`Removed document ${documentId} from context`);
        
        // Update local state
        setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        // Update the cache
        setDocumentCache(prev => ({
          ...prev,
          [conversationId]: prev[conversationId]?.filter(doc => doc.id !== documentId) || []
        }));
        
        toast.success('Document removed from context', { 
          duration: 2000,
          id: 'doc-removed',
        });
      }
    } catch (error) {
      console.error(`Error removing document ${documentId}:`, error);
      toast.error('Failed to remove document from context', {
        duration: 3000,
        id: 'doc-remove-error',
      });
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
  
  // Clear all contexts from cache when user explicitly resets
  const clearDocumentCache = useCallback(() => {
    setDocumentCache({});
    setSelectedDocuments([]);
    setLoadedConversationId(null);
    console.log('Document context cache cleared');
  }, []);

  return {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    documentCache,
    loadedConversationId,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    clearDocumentCache
  };
}
