
import { useMCP } from '@/hooks/use-mcp';
import { 
  useDocumentNavigation, 
  useDocumentLoading,
  useDocumentSelection,
  UseDocumentBrowserResult 
} from './document-browser';

/**
 * Main hook for document browsing functionality
 * Composes smaller hooks to provide a complete document browsing experience
 */
export function useDocumentBrowser(): UseDocumentBrowserResult {
  const { listDocuments, documents, isLoading, driveConnected } = useMCP();
  
  // Use the navigation hook to handle folder navigation state
  const {
    currentFolder,
    setCurrentFolder,
    folderHistory,
    setFolderHistory,
    isOpen,
    setIsOpen,
    handleBack,
    navigateToFolder,
    navigateToRoot
  } = useDocumentNavigation();
  
  // Use the loading hook to handle document loading
  const {
    refreshCurrentFolder
  } = useDocumentLoading(isOpen, driveConnected, currentFolder, listDocuments);
  
  // Use the selection hook to handle document selection
  const {
    handleDocumentClick
  } = useDocumentSelection(
    documents,
    currentFolder,
    folderHistory,
    setCurrentFolder,
    setFolderHistory
  );

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
    refreshCurrentFolder
  };
}
