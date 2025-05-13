
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';

interface UseDocumentContextLoaderProps {
  conversationId: string | null;
  setSelectedDocuments: (docs: any[]) => void;
}

/**
 * Hook for loading document context
 */
export function useDocumentContextLoader({ 
  conversationId, 
  setSelectedDocuments 
}: UseDocumentContextLoaderProps) {
  const { client } = useMCP();
  const [lastConversationId, setLastConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load document context when conversation ID or client changes
  const loadDocumentContext = useCallback(async (forceRefresh = false) => {
    if (!client) {
      console.log("Cannot load document context: MCP client not available");
      return;
    }
    
    if (!conversationId) {
      console.log("Cannot load document context: Conversation ID not available");
      return;
    }
    
    // Skip reload if conversation ID hasn't changed and no force refresh
    if (conversationId === lastConversationId && !forceRefresh) {
      console.log(`Skipping reload for same conversation ID: ${conversationId}`);
      return;
    }
    
    console.log(`Loading document context for conversation ${conversationId}${forceRefresh ? ' (forced)' : ''}`);
    setLastConversationId(conversationId);
    setIsLoading(true);
    
    try {
      // Always initialize context first to ensure we have the latest
      await client.initializeContext(conversationId);
      console.log(`Context initialized for conversation ${conversationId}`);
      
      const context = client.getModelContext();
      console.log("Loading document context. Context available:", !!context);
      
      if (context?.documentContext) {
        const docs = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          mimeType: `application/${doc.documentType}`,
          content: doc.content
        }));
        
        if (docs.length === 0) {
          console.log("Document context is empty");
        } else {
          console.log(`Documents loaded: ${docs.length}`, docs.map(d => d.name));
          
          // Verify document content integrity
          let contentMissing = false;
          docs.forEach((doc, index) => {
            console.log(`Document ${index + 1}: ${doc.name}, Content length: ${doc.content?.length || 0}`);
            if (!doc.content || doc.content.length === 0) {
              console.warn(`⚠️ Document ${doc.name} has no content!`);
              contentMissing = true;
            }
          });
          
          if (contentMissing) {
            console.error("Some documents have missing content! Attempting recovery...");
            // This isn't ideal but we'll try to work with what we have
          }
        }
        
        setSelectedDocuments(docs);
      } else {
        console.log("No document context available");
        setSelectedDocuments([]);
      }
    } catch (error) {
      console.error("Error loading document context:", error);
      toast.error("Failed to load document context", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  }, [client, conversationId, lastConversationId, setSelectedDocuments]);

  // Initial load of document context
  useEffect(() => {
    if (conversationId && conversationId !== lastConversationId) {
      loadDocumentContext();
    }
  }, [conversationId, loadDocumentContext, lastConversationId]);
  
  // Set up event listeners for context changes
  useEffect(() => {
    const handleContextUpdate = (event: CustomEvent) => {
      console.log("Document context updated event received:", event.detail);
      loadDocumentContext(true);
    };
    
    // TypeScript type assertion for custom event
    window.addEventListener('documentContextUpdated', handleContextUpdate as EventListener);
    
    // Also reload when tab becomes visible
    const handleTabVisibilityChange = () => {
      if (!document.hidden && client && conversationId) {
        console.log("Document became visible, reloading document context");
        loadDocumentContext(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleTabVisibilityChange);
    
    // Clean up listeners
    return () => {
      window.removeEventListener('documentContextUpdated', handleContextUpdate as EventListener);
      document.removeEventListener('visibilitychange', handleTabVisibilityChange);
    };
  }, [client, conversationId, loadDocumentContext]);

  return {
    isLoading,
    loadDocumentContext
  };
}
