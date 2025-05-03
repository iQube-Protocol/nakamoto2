import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { useDocumentSelectorContext } from '@/components/shared/document/DocumentSelectorContext';

interface FolderHistory {
  id: string;
  name: string;
}

export function useDocumentBrowser() {
  try {
    // Access MCP directly instead of through context
    const mcp = useMCP();
    
    // Create a local documents state to manage documents when mcp.documents is not available
    const [localDocuments, setLocalDocuments] = useState<any[]>([]);
    
    // Add default values to handle undefined properties
    const { 
      listDocuments = () => Promise.resolve([]), 
      driveConnected = false,
      isLoading: mcpIsLoading = false,
      documents: mcpDocuments = [] // Extract documents from MCP with default empty array
    } = mcp || {};
    
    // Use MCP documents if available, otherwise use local documents state
    const documents = Array.isArray(mcpDocuments) ? mcpDocuments : localDocuments;
    const isLoading = mcpIsLoading;
    
    const [currentFolder, setCurrentFolder] = useState<string>('');
    const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
    
    // Get isOpen from context if available, otherwise use local state
    const [isOpenLocal, setIsOpenLocal] = useState(false);
    const contextValue = useDocumentSelectorContextSafe();
    const isOpen = contextValue?.isOpen ?? isOpenLocal;
    
    // Fetch documents when dialog opens or folder changes
    useEffect(() => {
      if (!mcp || !listDocuments) {
        console.error("MCP or listDocuments is not available");
        return;
      }
      
      if (isOpen && driveConnected) {
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
    }, [isOpen, driveConnected, currentFolder, listDocuments, mcp]);

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
    
    // Updated to return a Promise so it can be properly caught
    const refreshCurrentFolder = useCallback((): Promise<any[]> => {
      if (!mcp || !listDocuments) {
        console.error("MCP or listDocuments function is not available");
        return Promise.reject("MCP or listDocuments function is not available");
      }
      
      return listDocuments(currentFolder).then(docs => {
        if (Array.isArray(docs)) {
          setLocalDocuments(docs);
        }
        return docs;
      });
    }, [listDocuments, currentFolder, mcp]);

    return {
      documents: Array.isArray(documents) ? documents : [],
      isLoading,
      currentFolder,
      folderHistory,
      isOpen,
      setIsOpen: setIsOpenLocal,
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
      refreshCurrentFolder: () => Promise.resolve([])
    };
  }
}

// Helper hook to safely access context even when outside provider
function useDocumentSelectorContextSafe() {
  try {
    return useDocumentSelectorContext();
  } catch (e) {
    // Return null if context is not available (component is used outside provider)
    return null;
  }
}
