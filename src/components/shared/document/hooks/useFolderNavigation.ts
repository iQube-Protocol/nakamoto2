
import { useState, useCallback } from 'react';
import { FolderHistory } from '../types/documentSelectorTypes';

export const useFolderNavigation = () => {
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  
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
  
  const handleFolderClick = useCallback((doc: any, documents: any[]) => {
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
      return true;
    }
    return false;
  }, [currentFolder, folderHistory]);
  
  return {
    currentFolder,
    folderHistory,
    navigateToFolder,
    navigateToRoot,
    handleBack,
    handleFolderClick
  };
};
