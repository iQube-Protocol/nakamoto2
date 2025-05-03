
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
      handleFileSelection 
    } = useDocumentSelectorContext();
    
    if (!navigateToFolder || !navigateToRoot || !handleBack || !handleFileSelection) {
      console.error("Document browser context missing required functions");
      return <div className="py-4 text-center text-muted-foreground">Error: Unable to load document browser</div>;
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
      
        {/* File grid */}
        <FileGrid
          handleDocumentClick={handleFileSelection}
          handleBack={handleBack}
        />
      </div>
    );
  } catch (error) {
    console.error("Error rendering DocumentBrowser:", error);
    return <div className="py-4 text-center text-muted-foreground">Error loading document browser</div>;
  }
};

export default DocumentBrowser;
