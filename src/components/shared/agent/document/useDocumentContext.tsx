
import { useState, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
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
  
  // Load document context when conversation ID or client changes
  const loadDocumentContext = useCallback(async () => {
    const documents = await loadDocumentsFromContext(client, conversationId);
    setSelectedDocuments(documents);
  }, [client, conversationId]);
  
  // Set up event listeners for context changes
  useDocumentEvents(loadDocumentContext);
  
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
    onDocumentAdded,
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
    loadDocumentContext
  };
}
