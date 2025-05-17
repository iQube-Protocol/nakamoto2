
import { useState, useCallback } from 'react';

/**
 * Hook for document viewing functionality
 */
export function useDocumentViewer() {
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, name: string, mimeType: string} | null>(null);
  
  // Handle document viewing
  const handleViewDocument = useCallback((document: any) => {
    setViewingDocument({
      id: document.id,
      name: document.name,
      content: document.content || "Content not available",
      mimeType: document.mimeType
    });
  }, []);

  return {
    viewingDocument,
    setViewingDocument,
    handleViewDocument
  };
}
