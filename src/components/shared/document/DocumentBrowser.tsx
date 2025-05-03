
import React from 'react';
import FolderBreadcrumb from './FolderBreadcrumb';
import FileGrid from './FileGrid';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

const DocumentBrowser: React.FC = () => {
  // Create default values for when context isn't available
  const defaultValues = {
    currentFolder: '',
    folderHistory: [],
    navigateToFolder: (folderId: string) => {},
    navigateToRoot: () => {},
    handleBack: () => {},
    handleFileSelection: (doc: any) => doc
  };
  
  // Local state to track if the component is mounted within a provider
  const [contextAvailable, setContextAvailable] = React.useState<boolean>(true);
  
  // Try to access context but don't throw if unavailable
  let contextValue;
  try {
    contextValue = useDocumentSelectorContext();
    // If we get here, the context is available
  } catch (error) {
    // If we get here, the context is not available
    if (contextAvailable) {
      console.warn("DocumentBrowser: DocumentSelectorContext not available, using defaults");
      setContextAvailable(false);
    }
    // Continue with default values
  }
  
  // Extract values safely, using defaults as fallback
  const currentFolder = contextValue?.currentFolder || defaultValues.currentFolder;
  const folderHistory = contextValue?.folderHistory || defaultValues.folderHistory;
  const navigateToFolder = contextValue?.navigateToFolder || defaultValues.navigateToFolder;
  const navigateToRoot = contextValue?.navigateToRoot || defaultValues.navigateToRoot;
  const handleBack = contextValue?.handleBack || defaultValues.handleBack;
  const handleFileSelection = contextValue?.handleFileSelection || defaultValues.handleFileSelection;
  
  return (
    <div className="py-4 h-[300px] overflow-y-auto">
      {/* Breadcrumb navigation */}
      <FolderBreadcrumb
        currentFolder={currentFolder}
        folderHistory={folderHistory}
        navigateToFolder={navigateToFolder}
        navigateToRoot={navigateToRoot}
      />
    
      {/* File grid with fallback for missing props */}
      <FileGrid
        handleDocumentClick={handleFileSelection}
        handleBack={handleBack}
      />
    </div>
  );
};

export default DocumentBrowser;
