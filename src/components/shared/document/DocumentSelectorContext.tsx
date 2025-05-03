
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useFolderNavigation } from './hooks/useFolderNavigation';
import { useConnectionState } from './hooks/useConnectionState';
import { useDocumentOperations } from './hooks/useDocumentOperations';
import { DocumentSelectorContextProps } from './types/documentSelectorTypes';

const DocumentSelectorContext = createContext<DocumentSelectorContextProps | undefined>(undefined);

export const useDocumentSelectorContext = () => {
  const context = useContext(DocumentSelectorContext);
  if (context === undefined) {
    throw new Error('useDocumentSelectorContext must be used within a DocumentSelectorProvider');
  }
  return context;
};

export const DocumentSelectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get folder navigation state and functions
  const {
    currentFolder,
    folderHistory,
    navigateToFolder,
    navigateToRoot,
    handleBack,
    handleFolderClick
  } = useFolderNavigation();
  
  // Get connection state and functions
  const {
    connecting,
    apiLoadingState,
    setApiLoadingState,
    apiCheckAttempts,
    setApiCheckAttempts,
    connectionError,
    setConnectionError,
    refreshAttempts,
    setRefreshAttempts,
    isApiLoading,
    checkApiStatus,
    connectionInProgress,
    connectionAttempts,
    handleConnectClick,
    handleResetConnection
  } = useConnectionState();
  
  // Get document operations
  const {
    documents,
    documentsLoading,
    handleRefreshDocuments
  } = useDocumentOperations();
  
  // MCP and drive connection state
  const { driveConnected, connectionStatus } = useMCP();
  
  const [isOpen, setIsOpen] = useState(false);
  
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
  }, [checkApiStatus, setApiLoadingState, setApiCheckAttempts]);
  
  const handleDialogChange = useCallback((open: boolean) => {
    setIsOpen(open);
    
    // Reset API loading state when reopening the dialog
    if (open && apiLoadingState === 'error') {
      setApiLoadingState('loading');
      setApiCheckAttempts(0);
    }
    
    // Auto-refresh document list when opening the dialog if connected
    if (open && driveConnected && !documentsLoading) {
      handleRefreshDocuments().catch(err => {
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
  }, [
    apiLoadingState, 
    setApiLoadingState, 
    setApiCheckAttempts, 
    driveConnected, 
    documentsLoading, 
    handleRefreshDocuments, 
    setConnectionError
  ]);
  
  const handleFileSelection = useCallback((doc: any) => {
    // Handle folder navigation
    const isFolder = handleFolderClick(doc, documents);
    
    // If not a folder, document was selected
    if (!isFolder) {
      setIsOpen(false);
    }
    
    return doc;
  }, [handleFolderClick, documents]);
  
  // If we have credentials stored but haven't fetched documents yet
  useEffect(() => {
    if (driveConnected && isOpen && documents.length === 0 && !documentsLoading) {
      console.log('DocumentSelector: Auto-refreshing documents');
      handleRefreshDocuments().catch(err => {
        console.error('Failed to auto-refresh documents:', err);
        setConnectionError(true);
      });
    }
  }, [driveConnected, isOpen, documents, documentsLoading, handleRefreshDocuments, setConnectionError]);
  
  // Reset connection error if connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setConnectionError(false);
    } else if (connectionStatus === 'error') {
      setConnectionError(true);
    }
  }, [connectionStatus, setConnectionError]);
  
  // Determine overall API loading state
  useEffect(() => {
    if (isApiLoading) {
      setApiLoadingState('loading');
    }
  }, [isApiLoading, setApiLoadingState]);

  // Loading states
  const isProcessing = documentsLoading || isApiLoading || connecting || connectionInProgress;

  const value: DocumentSelectorContextProps = {
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
    
    // Add folder navigation props
    currentFolder,
    folderHistory,
    navigateToFolder,
    navigateToRoot,
    handleBack,
    
    // Add connection props
    connectionInProgress,
    connectionAttempts
  };

  return (
    <DocumentSelectorContext.Provider value={value}>
      {children}
    </DocumentSelectorContext.Provider>
  );
};
