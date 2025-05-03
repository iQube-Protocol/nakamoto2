
export interface FolderHistory {
  id: string;
  name: string;
}

export interface DocumentSelectorContextProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  apiLoadingState: 'loading' | 'loaded' | 'error';
  apiCheckAttempts: number;
  connecting: boolean;
  connectionError: boolean;
  refreshAttempts: number;
  
  // Document browsing props
  currentFolder: string;
  folderHistory: FolderHistory[];
  navigateToFolder: (folderId: string, historyIndex?: number) => void;
  navigateToRoot: () => void;
  handleBack: () => void;
  
  // Connection handling props
  connectionInProgress: boolean;
  connectionAttempts: number;
  
  handleConnectClick: () => Promise<boolean>;
  handleResetConnection: () => void;
  handleRefreshDocuments: () => Promise<void>;
  handleDialogChange: (open: boolean) => void;
  handleFileSelection: (doc: any) => void;
  
  documents: any[];
  documentsLoading: boolean;
  isProcessing: boolean;
  driveConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}
