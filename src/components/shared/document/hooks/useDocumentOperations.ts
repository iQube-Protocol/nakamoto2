
import { useCallback } from 'react';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useDocumentBrowser } from '@/hooks/useDocumentBrowser';

export const useDocumentOperations = () => {
  const { driveConnected, connectionStatus } = useMCP();
  const { 
    documents, 
    isLoading: documentsLoading, 
    refreshCurrentFolder 
  } = useDocumentBrowser();
  
  // Handle refresh with retry count and error handling
  const handleRefreshDocuments = useCallback(async (): Promise<void> => {
    try {
      await refreshCurrentFolder();
      // Return void to match the expected return type
      return;
    } catch (error) {
      console.error('Error refreshing documents:', error);
      throw error;
    }
  }, [refreshCurrentFolder]);
  
  return {
    documents,
    documentsLoading,
    handleRefreshDocuments,
    driveConnected,
    connectionStatus
  };
};
