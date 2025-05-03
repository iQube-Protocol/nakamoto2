
export interface DocumentSelectorContextProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  documents: any[];
  documentsLoading: boolean;
  isProcessing: boolean;
  driveConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connecting: boolean;
  connectionError: boolean;
  refreshAttempts: number;
  apiLoadingState: 'loading' | 'loaded' | 'error';
  apiCheckAttempts: number;
  connectionInProgress: boolean;
  connectionAttempts: number;
  
  // Folder navigation
  folderHistory: Array<FolderHistory>;
  currentFolder?: string;
  navigateToFolder: (folderId: string, historyIndex?: number) => void;
  navigateToRoot: () => void;
  handleBack: () => void;
  
  // Actions
  handleDialogChange: (open: boolean) => void;
  handleFileSelection: (doc: any) => any;
  handleRefreshDocuments: () => Promise<void>;
  handleConnectClick: () => Promise<boolean>;
  handleResetConnection: () => void;
}

// Add the missing FolderHistory type
export interface FolderHistory {
  id: string;
  name: string;
}
