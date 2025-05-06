
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

interface FolderHistory {
  id: string;
  name: string;
}

export function useDocumentBrowser() {
  const { listDocuments, documents, isLoading, driveConnected, forceRefreshDocuments } = useMCP();
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Fetch documents when dialog opens or folder changes
  useEffect(() => {
    if (isOpen && driveConnected) {
      refreshCurrentFolder();
      // After first load, set initial load to false
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [isOpen, driveConnected, currentFolder, isInitialLoad]);

  const handleDocumentClick = (doc: any) => {
    if (doc.mimeType.includes('folder')) {
      // Save current folder to history before navigating
      if (currentFolder) {
        // Find the current folder name from documents
        const currentFolderDoc = documents.find(d => d.id === currentFolder);
        if (currentFolderDoc) {
          setFolderHistory([...folderHistory, {
            id: currentFolder,
            name: currentFolderDoc.name
          }]);
        }
      }
      setCurrentFolder(doc.id);
    }
    return doc;
  };

  const handleBack = () => {
    if (folderHistory.length > 0) {
      // Go back to the previous folder
      const newHistory = [...folderHistory];
      const lastFolder = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolder(lastFolder?.id || '');
    } else {
      // Go back to root
      setCurrentFolder('');
    }
  };
  
  const navigateToFolder = (folderId: string, historyIndex?: number) => {
    if (historyIndex !== undefined) {
      // Navigate to specific folder in history
      setCurrentFolder(folderId);
      setFolderHistory(folderHistory.slice(0, historyIndex));
    } else {
      setCurrentFolder(folderId);
    }
  };
  
  const navigateToRoot = () => {
    setCurrentFolder('');
    setFolderHistory([]);
  };
  
  // Add retry counter to handle potential connection issues
  const [retryCount, setRetryCount] = useState(0);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
  // Use force refresh to bypass cache and get fresh data
  const forceRefreshCurrentFolder = useCallback(async () => {
    setFetchError(null);
    setRetryCount(0);
    setRefreshAttempts(prev => prev + 1);
    
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
    } catch (error) {
      console.error("Error refreshing folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch documents";
      setFetchError(errorMessage);
      toast.error("Failed to load documents", { 
        description: errorMessage
      });
    }
  }, [currentFolder, forceRefreshDocuments, refreshAttempts]);
  
  const refreshCurrentFolder = useCallback(async () => {
    if (!driveConnected) {
      setFetchError("Not connected to Google Drive");
      return;
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
          await forceRefreshCurrentFolder();
        } else {
          setRetryCount(prev => prev + 1);
        }
      } else {
        // Reset retry count on success
        setRetryCount(0);
      }
    } catch (error) {
      console.error("Error refreshing folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch documents";
      setFetchError(errorMessage);
      toast.error("Failed to load documents", { 
        description: errorMessage
      });
    }
  }, [driveConnected, listDocuments, currentFolder, retryCount, forceRefreshCurrentFolder]);

  return {
    documents,
    isLoading,
    currentFolder,
    folderHistory,
    isOpen,
    setIsOpen,
    handleDocumentClick,
    handleBack,
    navigateToFolder,
    navigateToRoot,
    refreshCurrentFolder,
    forceRefreshCurrentFolder,
    fetchError
  };
}
