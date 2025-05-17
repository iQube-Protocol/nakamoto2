
import { useState } from 'react';
import { FolderHistory } from './types';

/**
 * Hook for handling document browser navigation state and actions
 */
export function useDocumentNavigation() {
  const [currentFolder, setCurrentFolder] = useState('');
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
      setCurrentFolder(lastFolder?.id || '');
    } else {
      // Go back to root
      setCurrentFolder('');
    }
  };
  
  /**
   * Navigate to a specific folder
   */
  const navigateToFolder = (folderId: string, historyIndex?: number) => {
    if (historyIndex !== undefined) {
      // Navigate to specific folder in history
      setCurrentFolder(folderId);
      setFolderHistory(folderHistory.slice(0, historyIndex));
    } else {
      setCurrentFolder(folderId);
    }
  };
  
  /**
   * Navigate to root folder and clear history
   */
  const navigateToRoot = () => {
    setCurrentFolder('');
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
