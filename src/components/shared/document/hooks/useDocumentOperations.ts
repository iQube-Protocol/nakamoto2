
import { useCallback } from 'react';
import { useMCP } from '@/hooks/mcp/use-mcp';

export const useDocumentOperations = () => {
  const { refreshCurrentFolder, documents, isLoading: documentsLoading } = useDocumentBrowser();
  
  // Handle refresh with retry count and error handling
  const handleRefreshDocuments = useCallback(async () => {
    try {
      return await refreshCurrentFolder();
    } catch (error) {
      console.error('Error refreshing documents:', error);
      throw error;
    }
  }, [refreshCurrentFolder]);
  
  return {
    documents,
    documentsLoading,
    handleRefreshDocuments
  };
};

// Import inside the file to avoid circular dependencies
import { useDocumentBrowser } from '@/hooks/useDocumentBrowser';
