
import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/mcp/use-mcp';

interface FolderHistory {
  id: string;
  name: string;
}

export function useDocumentBrowser() {
  try {
    // Access MCP directly without trying to use the context
    const mcp = useMCP();
    
    // Create a local documents state to manage documents
    const [localDocuments, setLocalDocuments] = useState<any[]>([]);
    
    // Add default values to handle undefined properties
    const { 
      listDocuments = () => Promise.resolve([]), 
      driveConnected = false,
      isLoading: mcpIsLoading = false,
      documents: mcpDocuments = []
    } = mcp || {};
    
    // Use MCP documents if available, otherwise use local documents state
    const documents = Array.isArray(mcpDocuments) ? mcpDocuments : localDocuments;
    const isLoading = mcpIsLoading;
    
    const [currentFolder, setCurrentFolder] = useState<string>('');
    const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    
    // Fetch documents when folder changes
    useEffect(() => {
      if (!mcp || !listDocuments) {
        console.error("MCP or listDocuments is not available");
        return;
      }
      
      if (driveConnected) {
        console.log("Loading documents for folder:", currentFolder || 'root');
        listDocuments(currentFolder)
          .then(docs => {
            if (Array.isArray(docs)) {
              setLocalDocuments(docs);
            }
          })
          .catch(error => {
            console.error("Error listing documents:", error);
          });
      }
    }, [driveConnected, currentFolder, listDocuments, mcp]);

    const handleDocumentClick = useCallback((doc: any) => {
      if (!doc) return doc;
      
      if (doc.mimeType && doc.mimeType.includes('folder')) {
        // Save current folder to history before navigating
        if (currentFolder) {
          // Find the current folder name from documents
          const currentFolderDoc = Array.isArray(documents) ? 
            documents.find(d => d.id === currentFolder) : null;
            
          if (currentFolderDoc) {
            setFolderHistory(prev => [...prev, {
              id: currentFolder,
              name: currentFolderDoc.name
            }]);
          }
        }
        setCurrentFolder(doc.id);
      }
      return doc;
    }, [currentFolder, documents]);

    const handleBack = useCallback(() => {
      if (folderHistory.length > 0) {
        // Go back to the previous folder
        const newHistory = [...folderHistory];
        const lastFolder = newHistory.pop();
        setFolderHistory(newHistory);
        setCurrentFolder(lastFolder?.id || '');
      } else {
        // Go back to root
        setCurrentFolder('');
      }
    }, [folderHistory]);
    
    const navigateToFolder = useCallback((folderId: string, historyIndex?: number) => {
      if (historyIndex !== undefined) {
        // Navigate to specific folder in history
        setCurrentFolder(folderId);
        setFolderHistory(prev => prev.slice(0, historyIndex));
      } else {
        setCurrentFolder(folderId);
      }
    }, []);
    
    const navigateToRoot = useCallback(() => {
      setCurrentFolder('');
      setFolderHistory([]);
    }, []);
    
    // Updated to return a Promise<void> so it matches the expected type
    const refreshCurrentFolder = useCallback(async (): Promise<void> => {
      if (!mcp || !listDocuments) {
        console.error("MCP or listDocuments function is not available");
        throw new Error("MCP or listDocuments function is not available");
      }
      
      try {
        const docs = await listDocuments(currentFolder);
        if (Array.isArray(docs)) {
          setLocalDocuments(docs);
        }
      } catch (error) {
        console.error("Error refreshing folder:", error);
        throw error;
      }
    }, [listDocuments, currentFolder, mcp]);

    return {
      documents: Array.isArray(documents) ? documents : [],
      isLoading,
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
  } catch (error) {
    console.error("Error in useDocumentBrowser:", error);
    // Return safe default values
    return {
      documents: [],
      isLoading: false,
      currentFolder: '',
      folderHistory: [],
      isOpen: false,
      setIsOpen: () => {},
      handleDocumentClick: (doc: any) => doc,
      handleBack: () => {},
      navigateToFolder: () => {},
      navigateToRoot: () => {},
      refreshCurrentFolder: async () => {}
    };
  }
}
