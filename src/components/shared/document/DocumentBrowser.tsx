
import React from 'react';
import FolderBreadcrumb from './FolderBreadcrumb';
import FileGrid from './FileGrid';

const DocumentBrowser: React.FC = () => {
  // Create state to store context data safely
  const [browserData, setBrowserData] = React.useState({
    currentFolder: '',
    folderHistory: [] as Array<{id: string, name: string}>,
    navigateToFolder: (folderId: string) => {},
    navigateToRoot: () => {},
    handleBack: () => {},
    handleFileSelection: (doc: any) => doc
  });
  
  // Try to access context safely using dynamic import
  React.useEffect(() => {
    const loadContext = async () => {
      try {
        const { useDocumentSelectorContext } = await import('./DocumentSelectorContext');
        const context = useDocumentSelectorContext();
        
        if (context) {
          setBrowserData({
            currentFolder: context.currentFolder || '',
            folderHistory: Array.isArray(context.folderHistory) ? context.folderHistory : [],
            navigateToFolder: context.navigateToFolder || ((folderId: string) => {}),
            navigateToRoot: context.navigateToRoot || (() => {}),
            handleBack: context.handleBack || (() => {}),
            handleFileSelection: context.handleFileSelection || ((doc: any) => doc)
          });
        }
      } catch (error) {
        console.warn("DocumentBrowser: Failed to access DocumentSelectorContext", error);
      }
    };
    
    loadContext();
  }, []);
  
  return (
    <div className="py-4 h-[300px] overflow-y-auto">
      {/* Breadcrumb navigation */}
      <FolderBreadcrumb
        currentFolder={browserData.currentFolder}
        folderHistory={browserData.folderHistory}
        navigateToFolder={browserData.navigateToFolder}
        navigateToRoot={browserData.navigateToRoot}
      />
    
      {/* File grid with fallback for missing props */}
      <FileGrid
        handleDocumentClick={browserData.handleFileSelection}
        handleBack={browserData.handleBack}
      />
    </div>
  );
};

export default DocumentBrowser;
