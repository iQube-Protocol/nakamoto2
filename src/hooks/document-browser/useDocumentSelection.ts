
import { FolderHistory } from './types';

/**
 * Hook for handling document selection logic
 */
export function useDocumentSelection(
  documents: any[],
  currentFolder: string,
  folderHistory: FolderHistory[],
  setCurrentFolder: (folder: string) => void,
  setFolderHistory: (history: FolderHistory[]) => void
) {
  /**
   * Handle document click (selection or folder navigation)
   */
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
  
  return {
    handleDocumentClick
  };
}
