
import { useState } from 'react';
import { useDocumentRecovery } from './useDocumentRecovery';
import { useDocumentSelection } from './useDocumentSelection';
import { useDocumentViewer } from './useDocumentViewer';

interface UseDocumentActionsProps {
  client: any;
  conversationId: string | null;
  fetchDocument: (id: string) => Promise<string | null>;
  onDocumentAdded?: () => void;
  selectedDocuments: any[];
  setSelectedDocuments: (docs: any[] | ((prevDocs: any[]) => any[])) => void;
}

/**
 * Hook to handle document selection, removal, and viewing actions
 */
export function useDocumentActions({
  client,
  conversationId,
  fetchDocument,
  onDocumentAdded,
  selectedDocuments,
  setSelectedDocuments
}: UseDocumentActionsProps) {
  // Document recovery functionality
  const {
    documentErrors,
    setDocumentErrors,
    recoverDocumentContent
  } = useDocumentRecovery({
    client,
    conversationId,
    fetchDocument,
    selectedDocuments,
    setSelectedDocuments
  });

  // Document selection and removal functionality
  const {
    handleDocumentSelect,
    handleRemoveDocument
  } = useDocumentSelection({
    client,
    conversationId,
    fetchDocument,
    selectedDocuments,
    setSelectedDocuments,
    documentErrors,
    setDocumentErrors,
    onDocumentAdded
  });

  // Document viewing functionality
  const {
    viewingDocument,
    setViewingDocument,
    handleViewDocument
  } = useDocumentViewer();

  return {
    viewingDocument,
    setViewingDocument,
    handleDocumentSelect,
    handleRemoveDocument,
    handleViewDocument,
    documentErrors,
    recoverDocumentContent
  };
}
