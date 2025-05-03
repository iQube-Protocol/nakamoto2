
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';

interface DocumentSelectorContextProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  apiLoadingState: 'loading' | 'loaded' | 'error';
  apiCheckAttempts: number;
  connecting: boolean;
  connectionError: boolean;
  refreshAttempts: number;
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

const DocumentSelectorContext = createContext<DocumentSelectorContextProps | undefined>(undefined);

export const useDocumentSelectorContext = () => {
  const context = useContext(DocumentSelectorContext);
  if (context === undefined) {
    throw new Error('useDocumentSelectorContext must be used within a DocumentSelectorProvider');
  }
  return context;
};

export const DocumentSelectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isApiLoading, checkApiStatus } = useMCP();
  const [connecting, setConnecting] = useState(false);
  const [apiLoadingState, setApiLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [apiCheckAttempts, setApiCheckAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const {
    driveConnected,
    isLoading: connectionLoading,
    connectionInProgress,
    connectionAttempts,
    connectionStatus,
    handleConnect,
    resetConnection,
  } = useDriveConnection();
  
  const {
    documents,
    isLoading: documentsLoading,
    handleDocumentClick,
    refreshCurrentFolder
  } = useDocumentBrowser();
  
  useEffect(() => {
    // Check if Google API is available
    const checkGapiLoaded = () => {
      if ((window as any).gapi && (window as any).google?.accounts) {
        console.log('DocumentSelector: Google API detected as loaded');
        setApiLoadingState('loaded');
        return true;
      }
      
      // If we have access to the MCP API status check, use that too
      if (checkApiStatus && checkApiStatus()) {
        console.log('DocumentSelector: Google API detected as loaded via MCP');
        setApiLoadingState('loaded');
        return true;
      }
      
      return false;
    };

    // Initial check
    if (checkGapiLoaded()) {
      return; // Already loaded
    }

    // Set up an interval to check if API is loaded with a maximum number of attempts
    const maxApiCheckAttempts = 30;
    const interval = setInterval(() => {
      setApiCheckAttempts(prev => {
        const newCount = prev + 1;
        console.log(`API load check attempt: ${newCount}/${maxApiCheckAttempts}`);
        
        if (newCount >= maxApiCheckAttempts) {
          clearInterval(interval);
          setApiLoadingState('error');
          return newCount;
        }
        
        if (checkGapiLoaded()) {
          clearInterval(interval);
        }
        return newCount;
      });
    }, 1000);

    // Clean up interval
    return () => clearInterval(interval);
  }, [checkApiStatus]);
  
  const handleDialogChange = useCallback((open: boolean) => {
    setIsOpen(open);
    
    // Reset API loading state when reopening the dialog
    if (open && apiLoadingState === 'error') {
      setApiLoadingState('loading');
      setApiCheckAttempts(0);
    }
    
    // Auto-refresh document list when opening the dialog if connected
    if (open && driveConnected && !documentsLoading) {
      refreshCurrentFolder().catch(err => {
        console.error('Failed to refresh folder on dialog open:', err);
        setConnectionError(true);
      });
    }
    
    // If closing dialog, dismiss any persistent toasts
    if (!open) {
      // Dismiss any lingering toasts
      toast.dismiss('google-api-loading');
      toast.dismiss('drive-connection');
      toast.dismiss('reset-connection');
    }
  }, [apiLoadingState, driveConnected, documentsLoading, refreshCurrentFolder]);

  // Handle connection with better Promise handling
  const handleConnectClick = useCallback(async (): Promise<boolean> => {
    setConnecting(true);
    setConnectionError(false);
    try {
      console.log('DocumentSelector: Initiating connection process');
      const result = await handleConnect();
      if (!result) {
        setConnectionError(true);
      }
      return result;
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(true);
      return false;
    } finally {
      setConnecting(false);
    }
  }, [handleConnect]);
  
  // Handle reset connection with consistent UI feedback
  const handleResetConnection = useCallback(() => {
    // First reset API loading state
    setApiLoadingState('loading');
    setApiCheckAttempts(0);
    setConnectionError(false);
    
    // Then reset the connection
    resetConnection();
  }, [resetConnection]);
  
  // Handle refresh with retry count and error handling
  const handleRefreshDocuments = useCallback(async () => {
    try {
      setRefreshAttempts(prev => prev + 1);
      await refreshCurrentFolder();
      setConnectionError(false);
    } catch (error) {
      console.error('Error refreshing documents:', error);
      setConnectionError(true);
    }
  }, [refreshCurrentFolder]);
  
  // If we have credentials stored but haven't fetched documents yet
  useEffect(() => {
    if (driveConnected && isOpen && documents.length === 0 && !documentsLoading) {
      console.log('DocumentSelector: Auto-refreshing documents');
      handleRefreshDocuments();
    }
  }, [driveConnected, isOpen, documents.length, documentsLoading, handleRefreshDocuments]);
  
  // Reset connection error if connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setConnectionError(false);
    } else if (connectionStatus === 'error') {
      setConnectionError(true);
    }
  }, [connectionStatus]);
  
  // Determine overall API loading state
  useEffect(() => {
    if (isApiLoading) {
      setApiLoadingState('loading');
    }
  }, [isApiLoading]);
  
  const handleFileSelection = useCallback((doc: any) => {
    const result = handleDocumentClick(doc);
    // If not a folder, close the dialog
    if (!doc.mimeType.includes('folder')) {
      setIsOpen(false);
      return result;
    }
    return result;
  }, [handleDocumentClick]);

  // Loading states
  const isProcessing = connectionLoading || documentsLoading || isApiLoading || connecting || connectionInProgress;

  const value = {
    isOpen,
    setIsOpen,
    apiLoadingState,
    apiCheckAttempts,
    connecting,
    connectionError,
    refreshAttempts,
    handleConnectClick,
    handleResetConnection,
    handleRefreshDocuments,
    handleDialogChange,
    handleFileSelection,
    documents,
    documentsLoading,
    isProcessing,
    driveConnected,
    connectionStatus,
  };

  return (
    <DocumentSelectorContext.Provider value={value}>
      {children}
    </DocumentSelectorContext.Provider>
  );
};
