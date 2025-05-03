
import React from 'react';
import FolderBreadcrumb from './FolderBreadcrumb';
import FileGrid from './FileGrid';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

const DocumentBrowser: React.FC = () => {
  const { 
    currentFolder, 
    folderHistory, 
    navigateToFolder, 
    navigateToRoot, 
    handleBack,
    handleFileSelection 
  } = useDocumentSelectorContext();
  
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
};

export default DocumentBrowser;
