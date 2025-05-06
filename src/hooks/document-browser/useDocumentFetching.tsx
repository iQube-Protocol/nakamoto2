
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook for managing document fetching and refreshing
 */
export function useDocumentFetching(listDocuments: (folderId?: string) => Promise<any[]>, forceRefreshDocuments: (folderId?: string) => Promise<any[]>, driveConnected: boolean) {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const forceRefreshCurrentFolder = useCallback(async (currentFolder: string) => {
    setFetchError(null);
    setRetryCount(0);
    setRefreshAttempts(prev => prev + 1);
    setIsRefreshing(true);
    
    toast.loading("Forcing document refresh...", { id: "refreshing-docs", duration: 1500 });
    
    try {
      const result = await forceRefreshDocuments(currentFolder);
      
      if (!result || result.length === 0) {
        console.log(`Folder ${currentFolder || 'root'} might be empty or not accessible`);
        
        // Show more specific error message after multiple attempts
        if (refreshAttempts > 2) {
          setFetchError("Multiple refresh attempts failed. Please check your Google API connection and credentials.");
        }
      } else {
        // Reset refresh attempts counter on success
        setRefreshAttempts(0);
      }
      
      return result;
    } catch (error) {
      console.error("Error refreshing folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch documents";
      setFetchError(errorMessage);
      toast.error("Failed to load documents", { 
        description: errorMessage
      });
      return [];
    } finally {
      setIsRefreshing(false);
    }
  }, [forceRefreshDocuments, refreshAttempts]);
  
  const refreshCurrentFolder = useCallback(async (currentFolder: string) => {
    if (!driveConnected) {
      setFetchError("Not connected to Google Drive");
      return [];
    }
    
    setFetchError(null);
    
    try {
      const result = await listDocuments(currentFolder);
      
      if (!result || result.length === 0) {
        console.log(`Folder ${currentFolder || 'root'} is empty or not accessible`);
        
        // If we get an empty result multiple times, try force refreshing
        if (retryCount >= 2) {
          console.log('Multiple empty results, trying force refresh');
          setRetryCount(0);
          return forceRefreshCurrentFolder(currentFolder);
        } else {
          setRetryCount(prev => prev + 1);
        }
      } else {
        // Reset retry count on success
        setRetryCount(0);
      }
      
      return result;
    } catch (error) {
      console.error("Error refreshing folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch documents";
      setFetchError(errorMessage);
      toast.error("Failed to load documents", { 
        description: errorMessage
      });
      return [];
    }
  }, [driveConnected, listDocuments, retryCount, forceRefreshCurrentFolder]);

  return {
    fetchError,
    isRefreshing,
    refreshCurrentFolder,
    forceRefreshCurrentFolder
  };
}
