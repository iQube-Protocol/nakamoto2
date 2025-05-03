
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
  
  // Use state to avoid re-renders when context check fails
  const [contextState, setContextState] = React.useState<{
    available: boolean;
    currentFolder: string;
    folderHistory: any[];
    navigateToFolder: (folderId: string) => void;
    navigateToRoot: () => void;
    handleBack: () => void;
    handleFileSelection: (doc: any) => any;
  }>({
    available: true,
    ...defaultValues
  });
  
  // Try to access context just once on mount to avoid re-renders
  React.useEffect(() => {
    try {
      const contextValue = useDocumentSelectorContext();
      if (contextValue) {
        setContextState({
          available: true,
          currentFolder: contextValue.currentFolder || '',
          folderHistory: contextValue.folderHistory || [],
          navigateToFolder: contextValue.navigateToFolder || defaultValues.navigateToFolder,
          navigateToRoot: contextValue.navigateToRoot || defaultValues.navigateToRoot,
          handleBack: contextValue.handleBack || defaultValues.handleBack,
          handleFileSelection: contextValue.handleFileSelection || defaultValues.handleFileSelection
        });
      }
    } catch (error) {
      console.warn("DocumentBrowser: DocumentSelectorContext not available, using defaults");
      setContextState(prev => ({ ...prev, available: false }));
    }
  }, []);
  
  return (
    <div className="py-4 h-[300px] overflow-y-auto">
      {/* Breadcrumb navigation */}
      <FolderBreadcrumb
        currentFolder={contextState.currentFolder}
        folderHistory={contextState.folderHistory}
        navigateToFolder={contextState.navigateToFolder}
        navigateToRoot={contextState.navigateToRoot}
      />
    
      {/* File grid with fallback for missing props */}
      <FileGrid
        handleDocumentClick={contextState.handleFileSelection}
        handleBack={contextState.handleBack}
      />
    </div>
  );
};

export default DocumentBrowser;
