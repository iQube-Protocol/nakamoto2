
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useDocumentSelectorContext } from '@/components/shared/document/DocumentSelectorContext';

interface FolderHistory {
  id: string;
  name: string;
}

export function useDocumentBrowser() {
  try {
    const { listDocuments, documents = [], isLoading = false, driveConnected = false } = useMCP();
    const [currentFolder, setCurrentFolder] = useState('');
    const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
    
    // Get isOpen from context if available, otherwise use local state
    const contextValue = useDocumentSelectorContextSafely();
    const isOpen = contextValue?.isOpen ?? false;
    
    // Fetch documents when dialog opens or folder changes
    useEffect(() => {
      if (isOpen && driveConnected && listDocuments) {
        listDocuments(currentFolder).catch(error => {
          console.error("Error listing documents:", error);
        });
      }
    }, [isOpen, driveConnected, currentFolder, listDocuments]);

    const handleDocumentClick = useCallback((doc: any) => {
      if (!doc) return doc;
      
      if (doc.mimeType && doc.mimeType.includes('folder')) {
        // Save current folder to history before navigating
        if (currentFolder) {
          // Find the current folder name from documents
          const currentFolderDoc = Array.isArray(documents) ? 
            documents.find(d => d.id === currentFolder) : null;
            
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
    }, [currentFolder, documents, folderHistory]);

    const handleBack = useCallback(() => {
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
    }, [folderHistory]);
    
    const navigateToFolder = useCallback((folderId: string, historyIndex?: number) => {
      if (historyIndex !== undefined) {
        // Navigate to specific folder in history
        setCurrentFolder(folderId);
        setFolderHistory(folderHistory.slice(0, historyIndex));
      } else {
        setCurrentFolder(folderId);
      }
    }, [folderHistory]);
    
    const navigateToRoot = useCallback(() => {
      setCurrentFolder('');
      setFolderHistory([]);
    }, []);
    
    // Updated to return a Promise so it can be properly caught
    const refreshCurrentFolder = useCallback((): Promise<any[]> => {
      if (!listDocuments) {
        console.error("listDocuments function is not available");
        return Promise.reject("listDocuments function is not available");
      }
      return listDocuments(currentFolder);
    }, [listDocuments, currentFolder]);

    return {
      documents: Array.isArray(documents) ? documents : [],
      isLoading,
      currentFolder,
      folderHistory,
      isOpen,
      handleDocumentClick,
      handleBack,
      navigateToFolder,
      navigateToRoot,
      refreshCurrentFolder
    };
  } catch (error) {
    console.error("Error in useDocumentBrowser:", error);
    // Return safe default values
    return {
      documents: [],
      isLoading: false,
      currentFolder: '',
      folderHistory: [],
      isOpen: false,
      handleDocumentClick: (doc: any) => doc,
      handleBack: () => {},
      navigateToFolder: () => {},
      navigateToRoot: () => {},
      refreshCurrentFolder: () => Promise.resolve([])
    };
  }
}

// Helper hook to safely access context even when outside provider
function useDocumentSelectorContextSafely() {
  try {
    return useDocumentSelectorContext();
  } catch (e) {
    // Return null if context is not available (component is used outside provider)
    return null;
  }
}
