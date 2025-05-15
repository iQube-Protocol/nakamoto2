/**
 * Types for document browser hooks
 */

export interface FolderHistory {
  id: string;
  name: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  // Add any other properties needed
}

export interface UseDocumentBrowserResult {
  documents: any[];
  isLoading: boolean;
  currentFolder: string;
  folderHistory: FolderHistory[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleDocumentClick: (doc: any) => any;
  handleBack: () => void;
  navigateToFolder: (folderId: string, historyIndex?: number) => void;
  navigateToRoot: () => void;
  refreshCurrentFolder: () => void;
}
