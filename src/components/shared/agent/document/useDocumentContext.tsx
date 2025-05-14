
import { useState, useCallback, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';
import { loadDocumentsFromContext } from './utils/documentOperations';
import { useDocumentEvents, useDocumentUpdates } from './hooks/useDocumentEvents';
import { useDocumentActions } from './hooks/useDocumentActions';

interface UseDocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
}

/**
 * Custom hook for managing document context
 */
export default function useDocumentContext({ conversationId, onDocumentAdded }: UseDocumentContextProps) {
  const { client, fetchDocument, isLoading: mcpLoading } = useMCP();
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Load document context when conversation ID or client changes or on forced refresh
  const loadDocumentContext = useCallback(async () => {
    console.log(`Loading document context for conversation: ${conversationId}`);
    setIsLoading(true);
    
    if (!conversationId || !client) {
      console.log('Missing conversation ID or client, cannot load documents');
      setIsLoading(false);
      return;
    }
    
    try {
      const documents = await loadDocumentsFromContext(client, conversationId);
      console.log(`Loaded ${documents.length} documents from context`);
      setSelectedDocuments(documents);
      
      if (documents.length === 0) {
        console.log('No documents in context');
      } else {
        console.log('Documents in context:', documents.map(d => d.name));
      }
    } catch (error) {
      console.error('Error loading document context:', error);
      toast.error('Failed to load document context');
    } finally {
      setIsLoading(false);
    }
  }, [client, conversationId]);
  
  // Initial load effect
  useEffect(() => {
    if (conversationId && client) {
      console.log('Initial document context load triggered');
      loadDocumentContext();
    }
  }, [conversationId, client, loadDocumentContext]);
  
  // Force refresh effect
  useEffect(() => {
    if (forceRefresh > 0) {
      console.log('Force refresh document context triggered');
      loadDocumentContext();
    }
  }, [forceRefresh, loadDocumentContext]);
  
  // Set up event listeners for context changes
  useDocumentEvents(() => {
    console.log('Document context event triggered refresh');
    loadDocumentContext();
  });
  
  // Document actions (select, remove, view)
  const {
    viewingDocument,
    setViewingDocument,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument
  } = useDocumentActions({
    client,
    conversationId, 
    fetchDocument: async (documentId: string) => {
      setIsLoading(true);
      try {
        console.log(`Fetching document content for ${documentId}`);
        const content = await fetchDocument(documentId);
        if (!content) {
          throw new Error('Failed to fetch document content');
        }
        console.log(`Document content fetched, length: ${content.length}`);
        return content;
      } catch (error) {
        console.error(`Error fetching document ${documentId}:`, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onDocumentAdded: () => {
      // Call the parent callback if provided
      if (onDocumentAdded) {
        onDocumentAdded();
      }
      
      // Force a refresh to ensure we have the latest documents
      setForceRefresh(prev => prev + 1);
    },
    selectedDocuments,
    setSelectedDocuments
  });

  return {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading: isLoading || mcpLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    loadDocumentContext,
    forceRefresh,
    refreshDocuments: () => setForceRefresh(prev => prev + 1)
  };
}
