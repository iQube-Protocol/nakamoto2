
import { useState, useCallback } from 'react';

/**
 * Hook to manage document context updates
 */
export function useDocumentContextUpdates() {
  const [documentContextUpdated, setDocumentContextUpdated] = useState<number>(0);
  
  /**
   * Increment the document context update count to trigger re-renders
   */
  const handleDocumentContextUpdated = useCallback(() => {
    setDocumentContextUpdated(prev => prev + 1);
  }, []);
  
  return {
    documentContextUpdated,
    handleDocumentContextUpdated
  };
}
