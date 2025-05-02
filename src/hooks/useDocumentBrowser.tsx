
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

interface FolderHistory {
  id: string;
  name: string;
}

export function useDocumentBrowser() {
  const { listDocuments, documents, isLoading, driveConnected } = useMCP();
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Fetch documents when dialog opens or folder changes
  useEffect(() => {
    if (isOpen && driveConnected) {
      refreshCurrentFolder();
    }
  }, [isOpen, driveConnected, currentFolder]); // Remove listDocuments dependency to prevent excessive calls

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
  
  const refreshCurrentFolder = useCallback(async () => {
    if (!driveConnected) {
      setFetchError("Not connected to Google Drive");
      return;
    }
    
    setFetchError(null);
    
    try {
      const result = await listDocuments(currentFolder);
      
      if (result.length === 0) {
        // This could be a legitimate empty folder, so we don't set an error
        console.log(`Folder ${currentFolder || 'root'} is empty or not accessible`);
      }
    } catch (error) {
      console.error("Error refreshing folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch documents";
      setFetchError(errorMessage);
      toast.error("Failed to load documents", { 
        description: errorMessage
      });
    }
  }, [driveConnected, listDocuments, currentFolder]);

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
    fetchError
  };
}
