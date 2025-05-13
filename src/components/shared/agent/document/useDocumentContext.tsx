
import { useCallback } from 'react';
import { useSelectedDocuments } from './hooks/useSelectedDocuments';
import { useDocumentViewing } from './hooks/useDocumentViewing';
import { useDocumentContextLoader } from './hooks/useDocumentContextLoader';
import { useDocumentActions } from './hooks/useDocumentActions';

interface UseDocumentContextProps {
  conversationId: string | null;
  onDocumentAdded?: () => void;
}

/**
 * Main hook for managing document context
 * This combines several smaller hooks for better code organization
 */
export default function useDocumentContext({ conversationId, onDocumentAdded }: UseDocumentContextProps) {
  // Get document state from smaller hooks
  const { selectedDocuments, setSelectedDocuments } = useSelectedDocuments();
  const { viewingDocument, setViewingDocument, handleViewDocument } = useDocumentViewing();
  
  // Load document context
  const { isLoading, loadDocumentContext } = useDocumentContextLoader({ 
    conversationId, 
    setSelectedDocuments 
  });
  
  // Document actions (add/remove)
  const { handleDocumentSelect, handleRemoveDocument } = useDocumentActions({
    conversationId,
    selectedDocuments,
    setSelectedDocuments,
    onDocumentAdded
  });
  
  // Return everything needed by components
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
