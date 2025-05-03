
import { useCallback } from 'react';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useDocumentBrowser } from '@/hooks/useDocumentBrowser';

export const useDocumentOperations = () => {
  const { refreshCurrentFolder, documents, isLoading: documentsLoading } = useDocumentBrowser();
  
  // Handle refresh with retry count and error handling
  const handleRefreshDocuments = useCallback(async () => {
    try {
      await refreshCurrentFolder();
      return; // Return void to match the expected return type
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
