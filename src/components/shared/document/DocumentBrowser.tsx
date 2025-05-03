
import React from 'react';
import FolderBreadcrumb from './FolderBreadcrumb';
import FileGrid from './FileGrid';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

const DocumentBrowser: React.FC = () => {
  try {
    // Access context safely
    let currentFolder = '';
    let folderHistory: Array<{id: string, name: string}> = [];
    let navigateToFolder = (folderId: string) => {};
    let navigateToRoot = () => {};
    let handleBack = () => {};
    let handleFileSelection = (doc: any) => doc;
    
    try {
      const contextValue = useDocumentSelectorContext();
      
      // Safely extract values with defaults
      currentFolder = contextValue?.currentFolder || '';
      folderHistory = contextValue?.folderHistory || [];
      navigateToFolder = contextValue?.navigateToFolder || (() => {});
      navigateToRoot = contextValue?.navigateToRoot || (() => {});
      handleBack = contextValue?.handleBack || (() => {});
      handleFileSelection = contextValue?.handleFileSelection || ((doc) => doc);
    } catch (error) {
      console.error("Could not access document selector context:", error);
      // Continue with default values
    }
    
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
  } catch (error) {
    console.error("Error rendering DocumentBrowser:", error);
    return (
      <div className="py-4 text-center text-muted-foreground">
        Error loading document browser. Please try refreshing the page.
      </div>
    );
  }
};

export default DocumentBrowser;
