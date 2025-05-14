
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
  const { client, fetchDocument, isLoading } = useMCP();
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Load document context when conversation ID or client changes or on forced refresh
  const loadDocumentContext = useCallback(async () => {
    console.log(`Loading document context for conversation: ${conversationId}`);
    
    if (!conversationId || !client) {
      console.log('Missing conversation ID or client, cannot load documents');
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
  
  // Handle refresh trigger from documentUpdates prop
  const handleDocumentUpdates = useCallback((updates: number) => {
    if (updates > 0) {
      console.log(`Document updates property changed: ${updates}`);
      setForceRefresh(prev => prev + 1);
    }
  }, []);
  
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
    fetchDocument,
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
  
  // Handle document updates from parent components
  useDocumentUpdates(0, loadDocumentContext);

  return {
    selectedDocuments,
    viewingDocument,
    setViewingDocument,
    isLoading,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    loadDocumentContext,
    forceRefresh
  };
}
