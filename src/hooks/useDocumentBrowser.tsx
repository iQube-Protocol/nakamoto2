
import { useState, useCallback, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';

interface DocumentFolder {
  id: string;
  name: string;
}

export interface UseDocumentBrowserResult {
  documents: any[];
  isLoading: boolean;
  currentFolder: DocumentFolder | null;
  folderHistory: DocumentFolder[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleDocumentClick: (doc: any) => any;
  handleBack: () => void;
  navigateToFolder: (folder: DocumentFolder) => void;
  navigateToRoot: () => void;
  refreshCurrentFolder: () => Promise<void>;
}

/**
 * Main hook for document browsing functionality
 */
export function useDocumentBrowser(): UseDocumentBrowserResult {
  const { listDocuments, fetchDocument, isLoading: mcpLoading, driveConnected } = useMCP();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null);
  const [folderHistory, setFolderHistory] = useState<DocumentFolder[]>([]);
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
      console.log(`Loading documents from ${currentFolder?.name || 'root'} folder`);
      const docs = await listDocuments(currentFolder?.id);
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
  const navigateToFolder = useCallback((folder: DocumentFolder) => {
    console.log(`Navigating to folder: ${folder.name}`);
    setFolderHistory(prev => currentFolder ? [...prev, currentFolder] : prev);
    setCurrentFolder(folder);
  }, [currentFolder]);
  
  // Navigate to root
  const navigateToRoot = useCallback(() => {
    console.log('Navigating to root folder');
    setFolderHistory([]);
    setCurrentFolder(null);
  }, []);
  
  // Go back to previous folder
  const handleBack = useCallback(() => {
    if (folderHistory.length > 0) {
      const previousFolder = folderHistory[folderHistory.length - 1];
      setFolderHistory(prev => prev.slice(0, -1));
      setCurrentFolder(previousFolder);
      console.log(`Navigating back to: ${previousFolder.name}`);
    } else {
      setCurrentFolder(null);
      console.log('Navigating back to root');
    }
  }, [folderHistory]);
  
  // Handle document click - either navigate to folder or fetch document
  const handleDocumentClick = useCallback((doc: any) => {
    console.log(`Document clicked: ${doc.name} (${doc.mimeType})`);
    
    // If it's a folder, navigate to it
    if (doc.mimeType.includes('folder')) {
      navigateToFolder({
        id: doc.id,
        name: doc.name
      });
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
