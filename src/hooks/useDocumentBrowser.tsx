
import { useState, useCallback, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { useDocumentNavigation } from './document-browser/useDocumentNavigation';
import { useDocumentFetching } from './document-browser/useDocumentFetching';
import { useInitialLoad } from './document-browser/useInitialLoad';
import { toast } from 'sonner';

export function useDocumentBrowser() {
  const { documents, isLoading, driveConnected, listDocuments, forceRefreshDocuments } = useMCP();
  const [isOpen, setIsOpen] = useState(false);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const REFRESH_COOLDOWN = 3000; // 3 seconds between refreshes
  
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
  
  // Reset error count when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setApiErrorCount(0);
      setLastRefreshTime(0);
    }
  }, [isOpen]);
  
  // Create a callback for refreshing the current folder with cooldown
  const refreshCurrentFolder = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      console.log('Refresh requested too soon, enforcing cooldown period');
      return Promise.resolve(documents); // Return current documents to prevent UI flicker
    }
    
    if (apiErrorCount > 3) {
      console.log('Too many API errors, preventing further requests');
      toast.error('Google Drive connection issues', {
        description: 'Please try reconnecting to Google Drive'
      });
      return Promise.resolve([]);
    }
    
    setLastRefreshTime(now);
    return fetchRefreshCurrentFolder(currentFolder)
      .catch(err => {
        console.error('Error refreshing folder:', err);
        setApiErrorCount(prev => prev + 1);
        return [];
      });
  }, [fetchRefreshCurrentFolder, currentFolder, apiErrorCount, documents, lastRefreshTime]);
  
  // Create a callback for force refreshing the current folder with cooldown
  const forceRefreshCurrentFolder = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      console.log('Force refresh requested too soon, enforcing cooldown period');
      return Promise.resolve(documents);
    }
    
    if (apiErrorCount > 3) {
      setApiErrorCount(0); // Reset on manual refresh
    }
    
    setLastRefreshTime(now);
    return fetchForceRefreshCurrentFolder(currentFolder)
      .catch(err => {
        console.error('Error force refreshing folder:', err);
        setApiErrorCount(prev => prev + 1);
        return [];
      });
  }, [fetchForceRefreshCurrentFolder, currentFolder, apiErrorCount, documents, lastRefreshTime]);
  
  // Use the initialLoad hook with the refreshCurrentFolder callback
  const { isInitialLoad } = useInitialLoad(isOpen, driveConnected, refreshCurrentFolder);
  
  // Wrap the document click handler to include the current documents
  const handleDocumentClick = useCallback((doc: any) => {
    return navHandleDocumentClick(doc, documents);
  }, [navHandleDocumentClick, documents]);
  
  // If we have credentials stored but haven't fetched documents yet
  useEffect(() => {
    if (driveConnected && isOpen && documents.length === 0 && !isLoading && !isInitialLoad && apiErrorCount < 3) {
      const now = Date.now();
      if (now - lastRefreshTime > REFRESH_COOLDOWN) {
        refreshCurrentFolder();
      }
    }
  }, [driveConnected, isOpen, documents.length, isLoading, isInitialLoad, refreshCurrentFolder, apiErrorCount, lastRefreshTime]);

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
    isRefreshing,
    apiErrorCount
  };
}
