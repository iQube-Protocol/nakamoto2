
import { useState, useCallback, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { FolderHistory, DocumentFolder, UseDocumentBrowserResult } from '@/hooks/document-browser/types';

/**
 * Main hook for document browsing functionality
 */
export function useDocumentBrowser(): UseDocumentBrowserResult {
  const { listDocuments, fetchDocument, isLoading: mcpLoading, driveConnected } = useMCP();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load documents when dialog opens
  useEffect(() => {
    if (isOpen && driveConnected) {
      refreshCurrentFolder();
    }
  }, [isOpen, driveConnected]);
  
  // Refresh documents when folder changes
  const refreshCurrentFolder = useCallback(async () => {
    if (!driveConnected) return;
    
    setIsLoading(true);
    try {
      console.log(`Loading documents from ${currentFolder || 'root'} folder`);
      const docs = await listDocuments(currentFolder || undefined);
      setDocuments(docs || []);
      console.log(`Loaded ${docs?.length || 0} documents`);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolder, driveConnected, listDocuments]);
  
  // Navigate to a folder
  const navigateToFolder = useCallback((folderId: string, historyIndex?: number) => {
    if (historyIndex !== undefined) {
      // Navigate to specific folder in history
      setCurrentFolder(folderId);
      setFolderHistory(prev => prev.slice(0, historyIndex));
    } else {
      // Get folder name from documents list
      const folder = documents.find(doc => doc.id === folderId);
      
      if (currentFolder) {
        // Add current folder to history
        setFolderHistory(prev => [
          ...prev,
          {
            id: currentFolder,
            name: documents.find(d => d.id === currentFolder)?.name || 'Unknown'
          }
        ]);
      }
      
      console.log(`Navigating to folder: ${folder?.name || folderId}`);
      setCurrentFolder(folderId);
    }
  }, [currentFolder, documents]);
  
  // Navigate to root
  const navigateToRoot = useCallback(() => {
    console.log('Navigating to root folder');
    setFolderHistory([]);
    setCurrentFolder('');
  }, []);
  
  // Go back to previous folder
  const handleBack = useCallback(() => {
    if (folderHistory.length > 0) {
      const previousFolder = folderHistory[folderHistory.length - 1];
      setFolderHistory(prev => prev.slice(0, -1));
      setCurrentFolder(previousFolder.id);
      console.log(`Navigating back to: ${previousFolder.name}`);
    } else {
      setCurrentFolder('');
      console.log('Navigating back to root');
    }
  }, [folderHistory]);
  
  // Handle document click - either navigate to folder or fetch document
  const handleDocumentClick = useCallback((doc: any) => {
    console.log(`Document clicked: ${doc.name} (${doc.mimeType})`);
    
    // If it's a folder, navigate to it
    if (doc.mimeType.includes('folder')) {
      navigateToFolder(doc.id);
      return null;
    }
    
    // If it's a document, fetch it
    return {
      ...doc,
      getContent: async () => {
        console.log(`Fetching content for ${doc.name}`);
        try {
          const content = await fetchDocument(doc.id);
          return content;
        } catch (error) {
          console.error(`Error fetching document ${doc.name}:`, error);
          throw error;
        }
      }
    };
  }, [navigateToFolder, fetchDocument]);

  return {
    documents,
    isLoading: isLoading || mcpLoading,
    currentFolder,
    folderHistory,
    isOpen,
    setIsOpen,
    handleDocumentClick,
    handleBack,
    navigateToFolder,
    navigateToRoot,
    refreshCurrentFolder
  };
}
