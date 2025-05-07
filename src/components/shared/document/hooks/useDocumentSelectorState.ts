
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { DocumentSelectorContextProps } from '../types/documentSelectorTypes';
import { useFolderNavigation } from './useFolderNavigation';
import { useConnectionState } from './useConnectionState';
import { useDocumentOperations } from './useDocumentOperations';
import { useGoogleApiStatus } from './useGoogleApiStatus';

/**
 * Hook to manage DocumentSelector state
 */
export const useDocumentSelectorState = (): DocumentSelectorContextProps => {
  // Get folder navigation state and functions
  const {
    currentFolder,
    folderHistory,
    navigateToFolder,
    navigateToRoot,
    handleBack,
    handleFolderClick
  } = useFolderNavigation();
  
  // Get API loading status
  const {
    apiLoadingState,
    setApiLoadingState,
    apiCheckAttempts,
    setApiCheckAttempts,
    isApiLoading
  } = useGoogleApiStatus();
  
  // Get connection state and functions
  const {
    connecting,
    connectionError,
    setConnectionError,
    refreshAttempts,
    setRefreshAttempts,
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
    handleRefreshDocuments,
    driveConnected,
    connectionStatus
  } = useDocumentOperations();
  
  const [isOpen, setIsOpen] = useState(false);
  
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

  return {
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
};
