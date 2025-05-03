
import React from 'react';
import FolderBreadcrumb from './FolderBreadcrumb';
import FileGrid from './FileGrid';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

const DocumentBrowser: React.FC = () => {
  try {
    const { 
      currentFolder, 
      folderHistory = [], 
      navigateToFolder, 
      navigateToRoot, 
      handleBack,
      handleFileSelection,
      documents = [],
      documentsLoading = false
    } = useDocumentSelectorContext();
    
    // Add comprehensive null checks
    if (!navigateToFolder || !navigateToRoot || !handleBack || !handleFileSelection) {
      console.error("Document browser context missing required functions");
      return (
        <div className="py-4 text-center text-muted-foreground">
          Error: Unable to load document browser - missing required functions
        </div>
      );
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
