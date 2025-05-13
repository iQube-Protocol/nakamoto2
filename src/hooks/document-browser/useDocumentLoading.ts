
import { useEffect } from 'react';

/**
 * Hook for handling document loading logic
 */
export function useDocumentLoading(
  isOpen: boolean,
  driveConnected: boolean,
  currentFolder: string,
  listDocuments: (folderId?: string) => Promise<any[]>
) {
  // Fetch documents when dialog opens or folder changes
  useEffect(() => {
    if (isOpen && driveConnected) {
      listDocuments(currentFolder);
    }
  }, [isOpen, driveConnected, currentFolder, listDocuments]);
  
  /**
   * Refresh documents in current folder
   */
  const refreshCurrentFolder = () => {
    if (driveConnected) {
      // Only refresh if we're actually connected to avoid unnecessary calls
      console.log(`Refreshing folder: ${currentFolder || 'root'}`);
      listDocuments(currentFolder);
    }
  };
  
  return {
    refreshCurrentFolder
  };
}
