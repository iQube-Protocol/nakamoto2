
import { DocumentFolder, FolderHistory } from './types';

/**
 * Hook for handling document selection logic
 */
export function useDocumentSelection(
  documents: any[],
  currentFolder: DocumentFolder,
  folderHistory: FolderHistory[],
  setCurrentFolder: (folder: DocumentFolder) => void,
  setFolderHistory: (history: FolderHistory[]) => void
) {
  /**
   * Handle document click (selection or folder navigation)
   */
  const handleDocumentClick = (doc: any) => {
    if (doc.mimeType.includes('folder')) {
      // Save current folder to history before navigating
      if (currentFolder) {
        setFolderHistory([...folderHistory, currentFolder]);
      }
      setCurrentFolder({
        id: doc.id,
        name: doc.name
      });
    }
    return doc;
  };
  
  return {
    handleDocumentClick
  };
}
