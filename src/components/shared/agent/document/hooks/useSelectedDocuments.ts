
import { useState } from 'react';

/**
 * Hook for managing the selected documents state
 */
export function useSelectedDocuments() {
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  
  return {
    selectedDocuments,
    setSelectedDocuments
  };
}
