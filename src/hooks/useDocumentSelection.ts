import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DocumentFolder } from '@/hooks/document-browser/types';
import { useDocumentBrowser } from '@/hooks/useDocumentBrowser';
import { useDriveConnection } from '@/hooks/useDriveConnection';

interface UseDocumentSelectionResult {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  processingDoc: string | null;
  documents: any[];
  documentsLoading: boolean;
  currentFolder: DocumentFolder;
  folderHistory: any[];
  driveConnected: boolean;
  connectionLoading: boolean;
  clientId: string;
  setClientId: (clientId: string) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  handleConnect: () => Promise<boolean>;
  handleResetConnection: () => void;
  handleFileSelection: (doc: any) => Promise<void>;
  handleBack: () => void;
  navigateToFolder: (folder: DocumentFolder) => void;
  navigateToRoot: () => void;
  refreshCurrentFolder: () => void;
}

export function useDocumentSelection(
  onDocumentSelect: (document: any) => void
): UseDocumentSelectionResult {
  const {
    driveConnected,
    isLoading: connectionLoading,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    resetConnection
  } = useDriveConnection();
  
  const {
    documents,
    isLoading: documentsLoading,
    currentFolder,
    folderHistory,
    isOpen,
    setIsOpen,
    handleDocumentClick,
    handleBack,
    navigateToFolder,
    navigateToRoot,
    refreshCurrentFolder
  } = useDocumentBrowser();
  
  // Add local processing state
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);
  
  const handleFileSelection = useCallback(async (doc: any) => {
    // If it's a folder, just navigate to it
    if (doc.mimeType.includes('folder')) {
      handleDocumentClick(doc);
      return;
    }
    
    try {
      // Mark this document as processing
      setProcessingDoc(doc.id);
      console.log('Processing document selection:', doc.name);
      
      // Handle document click (this returns the document or a Promise)
      const result = handleDocumentClick(doc);
      
      // Process document selection
      await onDocumentSelect(result);
      
      // Clear processing state
      setProcessingDoc(null);
      
      // Only close dialog after successful document addition
      setIsOpen(false);
      toast.success('Document added to context');
    } catch (error) {
      console.error('Error selecting document:', error);
      
      // Clear processing state
      setProcessingDoc(null);
      
      // Show appropriate error message but keep dialog open for retry
      if (error.message?.includes('already in context')) {
        toast.info('Document already in context');
      } else {
        toast.error('Failed to add document to context', { 
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }, [handleDocumentClick, onDocumentSelect, setIsOpen]);
  
  const handleResetConnection = useCallback(async () => {
    await resetConnection();
    refreshCurrentFolder();
  }, [resetConnection, refreshCurrentFolder]);
  
  // Enhanced connect handler that refreshes documents after successful connection
  const handleEnhancedConnect = useCallback(async () => {
    const success = await handleConnect();
    if (success) {
      // If connection was successful, refresh documents
      refreshCurrentFolder();
    }
    return success;
  }, [handleConnect, refreshCurrentFolder]);
  
  return {
    isOpen,
    setIsOpen,
    processingDoc,
    documents,
    documentsLoading,
    currentFolder,
    folderHistory,
    driveConnected,
    connectionLoading,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect: handleEnhancedConnect,
    handleResetConnection,
    handleFileSelection,
    handleBack,
    navigateToFolder,
    navigateToRoot,
    refreshCurrentFolder
  };
}
