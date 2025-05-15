
import { useState } from 'react';
import { DocumentFolder, FolderHistory } from './types';

/**
 * Hook for handling document browser navigation state and actions
 */
export function useDocumentNavigation() {
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder>({ id: '', name: 'Root' });
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  /**
   * Handle navigation to a previous folder
   */
  const handleBack = () => {
    if (folderHistory.length > 0) {
      // Go back to the previous folder
      const newHistory = [...folderHistory];
      const lastFolder = newHistory.pop();
      setFolderHistory(newHistory);
      if (lastFolder) {
        setCurrentFolder(lastFolder);
      } else {
        setCurrentFolder({ id: '', name: 'Root' });
      }
    } else {
      // Go back to root
      setCurrentFolder({ id: '', name: 'Root' });
    }
  };
  
  /**
   * Navigate to a specific folder
   */
  const navigateToFolder = (folder: DocumentFolder, historyIndex?: number) => {
    if (historyIndex !== undefined) {
      // Navigate to specific folder in history
      setCurrentFolder(folder);
      setFolderHistory(folderHistory.slice(0, historyIndex));
    } else {
      setCurrentFolder(folder);
    }
  };
  
  /**
   * Navigate to root folder and clear history
   */
  const navigateToRoot = () => {
    setCurrentFolder({ id: '', name: 'Root' });
    setFolderHistory([]);
  };

  return {
    currentFolder,
    setCurrentFolder,
    folderHistory,
    setFolderHistory,
    isOpen,
    setIsOpen,
    handleBack,
    navigateToFolder,
    navigateToRoot
  };
}
