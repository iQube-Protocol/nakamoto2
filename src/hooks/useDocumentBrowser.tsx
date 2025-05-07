
import { useState, useCallback, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { useDocumentNavigation } from './document-browser/useDocumentNavigation';
import { useDocumentFetching } from './document-browser/useDocumentFetching';
import { useInitialLoad } from './document-browser/useInitialLoad';

export function useDocumentBrowser() {
  const { documents, isLoading, driveConnected, listDocuments, forceRefreshDocuments } = useMCP();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    currentFolder,
    folderHistory,
    handleDocumentClick: navHandleDocumentClick,
    handleBack,
    navigateToFolder,
    navigateToRoot
  } = useDocumentNavigation();
  
  const {
    fetchError,
    isRefreshing,
    refreshCurrentFolder: fetchRefreshCurrentFolder,
    forceRefreshCurrentFolder: fetchForceRefreshCurrentFolder
  } = useDocumentFetching(listDocuments, forceRefreshDocuments, driveConnected);
  
  // Create a callback for refreshing the current folder
  const refreshCurrentFolder = useCallback(() => {
    return fetchRefreshCurrentFolder(currentFolder);
  }, [fetchRefreshCurrentFolder, currentFolder]);
  
  // Create a callback for force refreshing the current folder
  const forceRefreshCurrentFolder = useCallback(() => {
    return fetchForceRefreshCurrentFolder(currentFolder);
  }, [fetchForceRefreshCurrentFolder, currentFolder]);
  
  // Use the initialLoad hook with the refreshCurrentFolder callback
  const { isInitialLoad } = useInitialLoad(isOpen, driveConnected, refreshCurrentFolder);
  
  // Wrap the document click handler to include the current documents
  const handleDocumentClick = useCallback((doc: any) => {
    return navHandleDocumentClick(doc, documents);
  }, [navHandleDocumentClick, documents]);
  
  // If we have credentials stored but haven't fetched documents yet
  useEffect(() => {
    if (driveConnected && isOpen && documents.length === 0 && !isLoading && !isInitialLoad) {
      refreshCurrentFolder();
    }
  }, [driveConnected, isOpen, documents.length, isLoading, isInitialLoad, refreshCurrentFolder]);

  return {
    documents,
    isLoading,
    currentFolder,
    folderHistory,
    isOpen,
    setIsOpen,
    handleDocumentClick,
    handleBack,
    navigateToFolder,
    navigateToRoot,
    refreshCurrentFolder,
    forceRefreshCurrentFolder,
    fetchError,
    isRefreshing
  };
}
